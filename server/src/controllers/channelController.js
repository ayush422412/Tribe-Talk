import { channelService } from "../services/channelService.js";

export const channelController = {
  async createChannel(req, res) {
    const channel = await channelService.createChannel(req.user._id, req.params.serverId, req.body);
    res.status(201).json({ channel });
  },

  async getServerChannels(req, res) {
    const channels = await channelService.getServerChannels(req.user._id, req.params.serverId);
    res.json({ channels });
  },

  async updateChannel(req, res) {
    const channel = await channelService.updateChannel(req.user._id, req.params.channelId, req.body);
    res.json({ channel });
  },

  async deleteChannel(req, res) {
    const result = await channelService.deleteChannel(req.user._id, req.params.channelId);
    res.json(result);
  }
};
