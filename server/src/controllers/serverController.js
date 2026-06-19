import { serverService } from "../services/serverService.js";

export const serverController = {
  async createServer(req, res) {
    const server = await serverService.createServer(req.user._id, req.body);
    res.status(201).json({ server });
  },

  async getMyServers(req, res) {
    const servers = await serverService.getMyServers(req.user._id);
    res.json({ servers });
  },

  async getServer(req, res) {
    const server = await serverService.getServer(req.user._id, req.params.serverId);
    res.json({ server });
  },

  async updateServer(req, res) {
    const server = await serverService.updateServer(req.user._id, req.params.serverId, req.body);
    res.json({ server });
  },

  async deleteServer(req, res) {
    const result = await serverService.deleteServer(req.user._id, req.params.serverId);
    res.json(result);
  },

  async joinServer(req, res) {
    const server = await serverService.joinServer(req.user._id, req.params.serverId);
    res.json({ server });
  },

  async leaveServer(req, res) {
    const server = await serverService.leaveServer(req.user._id, req.params.serverId);
    res.json({ server });
  }
};
