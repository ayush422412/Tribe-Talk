import { env } from "../shared/config/env.js";
import { getRedisClient } from "../shared/config/redis.js";
import { redisKeys } from "../shared/redis/keys.js";

export function redisRateLimit(scope) {
  return async (req, res, next) => {
    const redis = getRedisClient();

    if (!redis) {
      next();
      return;
    }

    try {
      const identifier = req.user?._id?.toString() ?? req.ip;
      const key = redisKeys.rateLimit(scope, identifier);
      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, env.rateLimitWindowSeconds);
      }

      res.setHeader("X-RateLimit-Limit", env.rateLimitMaxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(env.rateLimitMaxRequests - count, 0));

      if (count > env.rateLimitMaxRequests) {
        res.status(429).json({ message: "Too many requests. Please slow down." });
        return;
      }

      next();
    } catch (error) {
      next();
    }
  };
}
