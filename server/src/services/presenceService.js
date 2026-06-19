import { getRedisClient } from "../shared/config/redis.js";
import { redisKeys } from "../shared/redis/keys.js";

export const presenceService = {
  async addSocket(userId, socketId) {
    const redis = getRedisClient();

    if (!redis) {
      return { wasOffline: false };
    }

    const socketKey = redisKeys.userSockets(userId);
    const countBefore = await redis.sCard(socketKey);

    await redis.sAdd(socketKey, socketId);
    await redis.expire(socketKey, 60 * 60 * 24);
    await redis.sAdd(redisKeys.onlineUsers, userId.toString());

    return { wasOffline: countBefore === 0 };
  },

  async removeSocket(userId, socketId) {
    const redis = getRedisClient();

    if (!redis) {
      return { isOffline: false };
    }

    const socketKey = redisKeys.userSockets(userId);
    await redis.sRem(socketKey, socketId);

    const remainingSockets = await redis.sCard(socketKey);

    if (remainingSockets === 0) {
      await redis.del(socketKey);
      await redis.sRem(redisKeys.onlineUsers, userId.toString());
    }

    return { isOffline: remainingSockets === 0 };
  },

  async getOnlineUserIds() {
    const redis = getRedisClient();

    if (!redis) {
      return [];
    }

    return redis.sMembers(redisKeys.onlineUsers);
  }
};
