import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(authController.register));
authRoutes.post("/login", asyncHandler(authController.login));
authRoutes.post("/logout", asyncHandler(authController.logout));
authRoutes.get("/me", requireAuth, asyncHandler(authController.me));
