import express from "express";
import path from "node:path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./shared/config/env.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { authRoutes } from "./routes/authRoutes.js";
import { serverRoutes } from "./routes/serverRoutes.js";
import { channelRoutes } from "./routes/channelRoutes.js";
import { messageRoutes } from "./routes/messageRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { friendRoutes } from "./routes/friendRoutes.js";
import { redisRateLimit } from "./middlewares/rateLimitMiddleware.js";
import { isRedisConnected } from "./shared/config/redis.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use("/api", redisRateLimit("api"));
  app.use("/uploads", express.static(path.resolve("uploads")));

  app.get("/health", (req, res) => {
    res.json({ status: "ok", redis: isRedisConnected() ? "connected" : "unavailable" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/servers", serverRoutes);
  app.use("/api/channels", channelRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/friends", friendRoutes);

  app.use(errorMiddleware);

  return app;
}
