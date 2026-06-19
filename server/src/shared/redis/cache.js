import { getRedisClient } from "../config/redis.js";

export const cache = {
  async getJson(key) {
    const redis = getRedisClient();

    if (!redis) {
      return null;
    }

    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },

  async setJson(key, value, ttlSeconds = 60) {
    const redis = getRedisClient();

    if (!redis) {
      return;
    }

    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  },

  async del(...keys) {
    const redis = getRedisClient();

    if (!redis || keys.length === 0) {
      return;
    }

    await redis.del(keys);
  },

  async delByPattern(pattern) {
    const redis = getRedisClient();

    if (!redis) {
      return;
    }

    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
};
