import { Router } from "express";
import { friendController } from "../controllers/friendController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

export const friendRoutes = Router();

friendRoutes.use(requireAuth);

friendRoutes.get("/", asyncHandler(friendController.getOverview));
friendRoutes.post("/requests", asyncHandler(friendController.sendRequest));
friendRoutes.patch("/requests/:requestId", asyncHandler(friendController.respondToRequest));
friendRoutes.get("/:friendId/conversation", asyncHandler(friendController.getConversation));
friendRoutes.post("/:friendId/messages", asyncHandler(friendController.sendDirectMessage));
