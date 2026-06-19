import { serverRepository } from "../repositories/serverRepository.js";
import { channelRepository } from "../repositories/channelRepository.js";
import { messageRepository } from "../repositories/messageRepository.js";
import { AppError } from "../shared/errors/AppError.js";
import { cache } from "../shared/redis/cache.js";
import { redisKeys } from "../shared/redis/keys.js";
import { requirePermission, requireServerMember } from "./permissionService.js";

export const serverService = {
  async createServer(userId, { name, iconUrl = "" }) {
    if (!name || name.trim().length < 2) {
      throw new AppError("Server name must be at least 2 characters", 400);
    }

    const server = await serverRepository.create({
      name,
      iconUrl,
      owner: userId,
      members: [{ user: userId, role: "owner" }]
    });

    await channelRepository.create({
      server: server._id,
      name: "general",
      position: 0
    });

    await cache.del(redisKeys.serversForUser(userId));
    return server;
  },

  async getMyServers(userId) {
    const cacheKey = redisKeys.serversForUser(userId);
    const cachedServers = await cache.getJson(cacheKey);

    if (cachedServers) {
      return cachedServers;
    }

    const servers = await serverRepository.findByUserId(userId);
    await cache.setJson(cacheKey, servers, 30);

    return servers;
  },

  async getServer(userId, serverId) {
    const server = await serverRepository.findById(serverId);

    if (!server) {
      throw new AppError("Server not found", 404);
    }

    requireServerMember(server, userId);
    return server;
  },

  async updateServer(userId, serverId, data) {
    const server = await this.getServer(userId, serverId);
    requirePermission(server, userId, "manage_server");

    const updatedServer = await serverRepository.updateById(serverId, {
      name: data.name,
      iconUrl: data.iconUrl
    });

    await cache.del(redisKeys.serversForUser(userId));
    return updatedServer;
  },

  async deleteServer(userId, serverId) {
    const server = await this.getServer(userId, serverId);
    requirePermission(server, userId, "manage_server");

    const channels = await channelRepository.findByServerId(serverId);
    await Promise.all(channels.map((channel) => messageRepository.deleteByChannelId(channel._id)));
    await channelRepository.deleteByServerId(serverId);
    await serverRepository.deleteById(serverId);
    await cache.del(redisKeys.serversForUser(userId), redisKeys.channelsForServer(serverId));

    return { deleted: true };
  },

  async joinServer(userId, serverId) {
    const server = await serverRepository.findById(serverId);

    if (!server) {
      throw new AppError("Server not found", 404);
    }

    const isMember = server.members.some((member) => {
      const memberUserId = member.user?._id ?? member.user;
      return memberUserId.toString() === userId.toString();
    });

    if (isMember) {
      return server;
    }

    const updatedServer = await serverRepository.addMember(serverId, { user: userId, role: "member" });
    await cache.del(redisKeys.serversForUser(userId));

    return updatedServer;
  },

  async leaveServer(userId, serverId) {
    const server = await this.getServer(userId, serverId);

    if (server.owner.toString() === userId.toString()) {
      throw new AppError("Owner cannot leave their own server. Delete it instead.", 400);
    }

    const updatedServer = await serverRepository.removeMember(serverId, userId);
    await cache.del(redisKeys.serversForUser(userId));

    return updatedServer;
  }
};
