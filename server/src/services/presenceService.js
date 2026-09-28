import { getRedisClient } from "../shared/config/redis.js";
import { redisKeys } from "../shared/redis/keys.js";

// Service to manage user presence and socket connections across multiple server instances using Redis

export const presenceService = {

  // Add a socket ID for a user and check if the user was previously offline
  
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


  // Remove a socket ID for a user and check if the user is now offline

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


  // Get the list of online user IDs

  async getOnlineUserIds() {
    const redis = getRedisClient();

    if (!redis) {
      return [];
    }

    return redis.sMembers(redisKeys.onlineUsers);
  }
};
