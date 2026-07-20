import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { uploadImageFile } from "../middlewares/uploadMiddleware.js";

export const userRoutes = Router();

userRoutes.use(requireAuth);

userRoutes.get("/dashboard", asyncHandler(userController.getDashboard));
userRoutes.patch("/me", asyncHandler(userController.updateProfile));
userRoutes.post("/uploads/images", uploadImageFile, asyncHandler(userController.uploadImage));
