import { Router } from "express";
import { messageController } from "../controllers/messageController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { uploadMessageFile } from "../middlewares/uploadMiddleware.js";

export const messageRoutes = Router();

messageRoutes.use(requireAuth);

messageRoutes.route("/channels/:channelId")
  .get(asyncHandler(messageController.getChannelMessages))
  .post(asyncHandler(messageController.createMessage));

messageRoutes.post(
  "/channels/:channelId/uploads",
  uploadMessageFile,
  asyncHandler(messageController.uploadMessageFile)
);

messageRoutes.route("/:messageId")
  .patch(asyncHandler(messageController.editMessage))
  .delete(asyncHandler(messageController.deleteMessage));

messageRoutes.post("/:messageId/reactions", asyncHandler(messageController.toggleReaction));
