import { userService } from "../services/userService.js";
import { AppError } from "../shared/errors/AppError.js";
import { buildAttachment } from "../middlewares/uploadMiddleware.js";

export const userController = {
  async getDashboard(req, res) {
    const dashboard = await userService.getDashboard(req.user._id);
    res.json(dashboard);
  },

  async updateProfile(req, res) {
    const user = await userService.updateProfile(req.user._id, req.body);
    res.json({ user });
  },

  async uploadImage(req, res) {
    if (!req.file) {
      throw new AppError("Image file is required", 400);
    }

    res.status(201).json({ url: buildAttachment(req.file).url });
  }
};
