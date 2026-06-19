import { userRepository } from "../repositories/userRepository.js";
import { serverRepository } from "../repositories/serverRepository.js";
import { AppError } from "../shared/errors/AppError.js";

export const userService = {
  async getDashboard(userId) {
    const user = await userRepository.findById(userId);
    const servers = await serverRepository.findByUserId(userId);

    return {
      user,
      ownedServers: servers.filter((server) => server.owner.toString() === userId.toString()),
      joinedServers: servers.filter((server) => server.owner.toString() !== userId.toString())
    };
  },

  async updateProfile(userId, { username, avatarUrl, description }) {
    const update = {};

    if (username) {
      const normalizedUsername = username.toLowerCase().trim();
      const existingUser = await userRepository.findByUsername(normalizedUsername);

      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        throw new AppError("Username is already taken", 409);
      }

      update.username = normalizedUsername;
    }

    if (typeof avatarUrl === "string") {
      update.avatarUrl = avatarUrl.trim();
    }

    if (typeof description === "string") {
      update.description = description.trim();
    }

    return userRepository.updateById(userId, update);
  }
};
