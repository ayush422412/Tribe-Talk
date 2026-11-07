import { env } from "./env.js";

function getBullMqConnectionOptions() {
  const redisUrl = new URL(env.redisUrl);
  const isTls = redisUrl.protocol === "rediss:";

  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || (isTls ? 6380 : 6379)),
    username: redisUrl.username ? decodeURIComponent(redisUrl.username) : undefined,
    password: redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined,
    tls: isTls ? {} : undefined,
    maxRetriesPerRequest: null
  };
}

export const bullMqConnection = getBullMqConnectionOptions();
