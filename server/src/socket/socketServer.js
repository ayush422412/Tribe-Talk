import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import cookie from "cookie";
import { env } from "../shared/config/env.js";
import { getRedisClient, getRedisSubscriber } from "../shared/config/redis.js";
import { verifyAuthToken } from "../shared/utils/authToken.js";
import { userRepository } from "../repositories/userRepository.js";
import { messageService } from "../services/messageService.js";
import { presenceService } from "../services/presenceService.js";


// Function to create and configure the Socket.IO server

export function createSocketServer(httpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    }
  });

  const redisClient = getRedisClient();
  const redisSubscriber = getRedisSubscriber();
  // Use Redis adapter for scaling across multiple server instances
  if (redisClient && redisSubscriber) {
    io.adapter(createAdapter(redisClient, redisSubscriber));
  }
  // Middleware to authenticate socket connections

  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies[env.cookieName];
      const payload = verifyAuthToken(token);
      const user = await userRepository.findById(payload.userId);

      if (!user) {
        throw new Error("Unauthorized");
      } 

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  // Handle socket connection event

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);
    const { wasOffline } = await presenceService.addSocket(userId, socket.id);

    if (wasOffline) {
      io.emit("presence:user-online", {
        userId,
        username: socket.user.username
      });
    }


// Handle presence list request

    socket.on("presence:list", async (ack) => {
      const userIds = await presenceService.getOnlineUserIds();
      ack?.({ ok: true, userIds });
    });

    // Handle channel join event

    socket.on("channel:join", ({ channelId }) => {
      socket.join(`channel:${channelId}`);
    });

    // Handle channel leave event

    socket.on("channel:leave", ({ channelId }) => {
      socket.leave(`channel:${channelId}`);
    });

    // Handle message creation event

    socket.on("message:create", async ({ channelId, content }, ack) => {
      try {
        const message = await messageService.createMessage(socket.user._id, channelId, { content });
        io.to(`channel:${channelId}`).emit("message:created", { message });
        const memberIds = await messageService.getChannelMemberIds(socket.user._id, channelId);
        memberIds
          .filter((memberId) => memberId !== socket.user._id.toString())
          .forEach((memberId) => io.to(`user:${memberId}`).emit("channel:unread", { channelId }));
        ack?.({ ok: true, message });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
      }
    });

    // Handle typing start event

    socket.on("typing:start", ({ channelId }) => {
      socket.to(`channel:${channelId}`).emit("typing:started", {
        channelId,
        user: {
          id: socket.user._id.toString(),
          username: socket.user.username
        }
      });
    });

    // Handle typing stop event

    socket.on("typing:stop", ({ channelId }) => {
      socket.to(`channel:${channelId}`).emit("typing:stopped", {
        channelId,
        userId: socket.user._id.toString()
      });
    });

    
    // Handle user disconnect
    socket.on("disconnect", async () => {
      const { isOffline } = await presenceService.removeSocket(userId, socket.id);

      if (isOffline) {
        io.emit("presence:user-offline", { userId });
      }
    });
  });

  return io;
}








