import { createClient } from "redis";
import { env } from "./env.js";

let redisClient;
let redisSubscriber;
let isRedisReady = false;

function createRedisClient() {
  return createClient({
    url: env.redisUrl,
    socket: {
      connectTimeout: 1000,
      reconnectStrategy: false
    }
  });
}

export async function connectRedis() {
  redisClient = createRedisClient();
  redisSubscriber = redisClient.duplicate();

  redisClient.on("error", (error) => {
    isRedisReady = false;
    console.warn(`Redis client error: ${error.message}`);
  });

  redisSubscriber.on("error", (error) => {
    console.warn(`Redis subscriber error: ${error.message}`);
  });

  try {
    await redisClient.connect();
    await redisSubscriber.connect();
    isRedisReady = true;
    console.log("Redis connected");
  } catch (error) {
    isRedisReady = false;
    console.warn(`Redis unavailable: ${error.message}`);
  }
}

export function getRedisClient() {
  return isRedisReady ? redisClient : null;
}

export function getRedisSubscriber() {
  return isRedisReady ? redisSubscriber : null;
}

export function isRedisConnected() {
  return isRedisReady;
}
