import { Router } from "express";
import { channelController } from "../controllers/channelController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

export const channelRoutes = Router();

channelRoutes.use(requireAuth);

channelRoutes.route("/:channelId")
  .patch(asyncHandler(channelController.updateChannel))
  .delete(asyncHandler(channelController.deleteChannel));
