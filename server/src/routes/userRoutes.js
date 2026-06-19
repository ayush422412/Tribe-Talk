import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

export const userRoutes = Router();

userRoutes.use(requireAuth);

userRoutes.get("/dashboard", asyncHandler(userController.getDashboard));
userRoutes.patch("/me", asyncHandler(userController.updateProfile));
