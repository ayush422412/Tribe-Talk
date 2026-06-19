import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/userRepository.js";
import { AppError } from "../shared/errors/AppError.js";
import { signAuthToken } from "../shared/utils/authToken.js";

function toSafeUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl
  };
}

export const authService = {
  async register({ username, email, password }) {
    if (!username || !email || !password) {
      throw new AppError("Username, email, and password are required", 400);
    }

    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters", 400);
    }

    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError("Email is already registered", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepository.create({ username, email, passwordHash });
    const token = signAuthToken(user._id.toString());

    return { user: toSafeUser(user), token };
  },

  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = signAuthToken(user._id.toString());

    return { user: toSafeUser(user), token };
  },

  getCurrentUser(user) {
    return toSafeUser(user);
  }
};
