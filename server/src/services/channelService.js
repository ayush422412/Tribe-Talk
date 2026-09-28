import { channelRepository } from "../repositories/channelRepository.js";
import { messageRepository } from "../repositories/messageRepository.js";
import { channelReadStateRepository } from "../repositories/channelReadStateRepository.js";
import { serverService } from "./serverService.js";
import { requirePermission, requireServerMember } from "./permissionService.js";
import { AppError } from "../shared/errors/AppError.js";
import { cache } from "../shared/redis/cache.js";
import { redisKeys } from "../shared/redis/keys.js";

export const channelService = {

  // Create a new channel within a server, ensuring the user has permission to manage channels

  async createChannel(userId, serverId, { name }) {
    const server = await serverService.getServer(userId, serverId);
    requirePermission(server, userId, "manage_channels");

    if (!name || name.trim().length < 2) {
      throw new AppError("Channel name must be at least 2 characters", 400);
    }

    const channels = await channelRepository.findByServerId(serverId);

    const channel = await channelRepository.create({
      server: serverId,
      name: name.toLowerCase().replace(/\s+/g, "-"),
      position: channels.length
    });

    // New channel members begin with a read position at creation time.
    await channelReadStateRepository.initializeForUsers(
      channel._id,
      server.members.map((member) => member.user?._id ?? member.user)
    );
    await cache.del(redisKeys.channelsForServer(serverId));
    return channel;
  },


  // Get all channels for a server, ensuring the user is a member of the server and utilizing caching for performance
  async getServerChannels(userId, serverId) {
    const server = await serverService.getServer(userId, serverId);
    requireServerMember(server, userId);

    const cacheKey = redisKeys.channelsForServer(serverId);
    const cachedChannels = await cache.getJson(cacheKey);

    if (cachedChannels) {
      return cachedChannels;
    }

    const channels = await channelRepository.findByServerId(serverId);
    await cache.setJson(cacheKey, channels, 30);

    return channels;
  },


  // Update channel details such as name and position, ensuring the user has permission to manage channels

  async updateChannel(userId, channelId, data) {
    const channel = await channelRepository.findById(channelId);

    if (!channel) {
      throw new AppError("Channel not found", 404);
    }

    const server = await serverService.getServer(userId, channel.server);
    requirePermission(server, userId, "manage_channels");

    const update = {};

    if (data.name) {
      update.name = data.name.toLowerCase().replace(/\s+/g, "-");
    }

    if (typeof data.position === "number") {
      update.position = data.position;
    }

    const updatedChannel = await channelRepository.updateById(channelId, update);
    await cache.del(redisKeys.channelsForServer(channel.server));

    return updatedChannel;
  },


  // Delete a channel, ensuring the user has permission to manage channels and cleaning up associated messages

  async deleteChannel(userId, channelId) {
    const channel = await channelRepository.findById(channelId);

    if (!channel) {
      throw new AppError("Channel not found", 404);
    }

    const server = await serverService.getServer(userId, channel.server);
    requirePermission(server, userId, "manage_channels");

    await messageRepository.deleteByChannelId(channelId);
    await channelReadStateRepository.deleteByChannelId(channelId);
    await channelRepository.deleteById(channelId);
    await cache.del(redisKeys.channelsForServer(channel.server));

    return { deleted: true };
  }
};
