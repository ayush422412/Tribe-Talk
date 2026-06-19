import { env } from "../shared/config/env.js";
import { AppError } from "../shared/errors/AppError.js";
import { verifyAuthToken } from "../shared/utils/authToken.js";
import { userRepository } from "../repositories/userRepository.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.cookieName];

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const payload = verifyAuthToken(token);
    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw new AppError("User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError("Authentication required", 401));
  }
}
