import { userService } from "../services/userService.js";

export const userController = {
  async getDashboard(req, res) {
    const dashboard = await userService.getDashboard(req.user._id);
    res.json(dashboard);
  },

  async updateProfile(req, res) {
    const user = await userService.updateProfile(req.user._id, req.body);
    res.json({ user });
  }
};
