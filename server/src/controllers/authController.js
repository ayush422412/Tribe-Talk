import { authService } from "../services/authService.js";
import { clearAuthCookie, setAuthCookie } from "../shared/utils/cookie.js";

export const authController = {
  async register(req, res) {
    const result = await authService.register(req.body);
    setAuthCookie(res, result.token);
    res.status(201).json({ user: result.user });
  },

  async login(req, res) {
    const result = await authService.login(req.body);
    setAuthCookie(res, result.token);
    res.json({ user: result.user });
  },

  async logout(req, res) {
    clearAuthCookie(res);
    res.json({ message: "Logged out" });
  },

  async me(req, res) {
    res.json({ user: authService.getCurrentUser(req.user) });
  }
};
