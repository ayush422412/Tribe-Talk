import { messageService } from "../services/messageService.js";
import { buildAttachment } from "../middlewares/uploadMiddleware.js";
import { AppError } from "../shared/errors/AppError.js";

export const messageController = {
  async getChannelMessages(req, res) {
    const messages = await messageService.getChannelMessages(req.user._id, req.params.channelId, req.query);
    res.json({ messages });
  },

  async createMessage(req, res) {
    const message = await messageService.createMessage(req.user._id, req.params.channelId, req.body);
    res.status(201).json({ message });
  },

  async uploadMessageFile(req, res) {
    if (!req.file) {
      throw new AppError("File is required", 400);
    }

    const attachment = buildAttachment(req.file);
    const message = await messageService.createMessage(req.user._id, req.params.channelId, {
      content: req.body.content,
      attachments: [attachment]
    });

    res.status(201).json({ message });
  },

  async editMessage(req, res) {
    const message = await messageService.editMessage(req.user._id, req.params.messageId, req.body);
    res.json({ message });
  },

  async deleteMessage(req, res) {
    const result = await messageService.deleteMessage(req.user._id, req.params.messageId);
    res.json(result);
  },

  async toggleReaction(req, res) {
    const message = await messageService.toggleReaction(req.user._id, req.params.messageId, req.body);
    res.json({ message });
  }
};
