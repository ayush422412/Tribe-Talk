import { Router } from "express";
import { serverController } from "../controllers/serverController.js";
import { channelController } from "../controllers/channelController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

export const serverRoutes = Router();

serverRoutes.use(requireAuth);

serverRoutes.route("/")
  .get(asyncHandler(serverController.getMyServers))
  .post(asyncHandler(serverController.createServer));

serverRoutes.route("/:serverId")
  .get(asyncHandler(serverController.getServer))
  .patch(asyncHandler(serverController.updateServer))
  .delete(asyncHandler(serverController.deleteServer));

serverRoutes.post("/:serverId/join", asyncHandler(serverController.joinServer));
serverRoutes.post("/:serverId/leave", asyncHandler(serverController.leaveServer));

serverRoutes.route("/:serverId/channels")
  .get(asyncHandler(channelController.getServerChannels))
  .post(asyncHandler(channelController.createChannel));
