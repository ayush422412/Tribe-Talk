import { friendService } from "../services/friendService.js";

export const friendController = {
  async sendRequest(req, res) {
    const request = await friendService.sendRequest(req.user._id, req.body);
    res.status(201).json({ request });
  },

  async getOverview(req, res) {
    const overview = await friendService.getFriendOverview(req.user._id);
    res.json(overview);
  },

  async respondToRequest(req, res) {
    const request = await friendService.respondToRequest(
      req.user._id,
      req.params.requestId,
      req.body.status
    );
    res.json({ request });
  },

  async getConversation(req, res) {
    const conversation = await friendService.getConversation(req.user._id, req.params.friendId);
    res.json({ conversation });
  },

  async sendDirectMessage(req, res) {
    const conversation = await friendService.sendDirectMessage(
      req.user._id,
      req.params.friendId,
      req.body
    );
    res.status(201).json({ conversation });
  }
};
