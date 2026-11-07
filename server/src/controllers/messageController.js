import { messageService } from "../services/messageService.js";
import { buildAttachment } from "../middlewares/uploadMiddleware.js";
import { AppError } from "../shared/errors/AppError.js";
import { messageSearchService } from "../search/messageSearchService.js";

function broadcastMessage(req, event, message) {
  req.app.get("io")?.to(`channel:${message.channel}`).emit(event, { message });
}

async function broadcastUnreadUpdate(req, message) {
  const memberIds = await messageService.getChannelMemberIds(req.user._id, message.channel);
  for (const memberId of memberIds) {
    if (memberId !== message.author?._id?.toString()) {
      req.app.get("io")?.to(`user:${memberId}`).emit("channel:unread", { channelId: message.channel.toString() });
    }
  }
}

export const messageController = {
  async searchMessages(req, res) {
    const result = await messageSearchService.search(req.user._id, req.query);
    res.json(result);
  },

  async getChannelMessages(req, res) {
    const result = await messageService.getChannelMessages(req.user._id, req.params.channelId, req.query);
    res.json(result);
  },

  async markChannelRead(req, res) {
    await messageService.markChannelRead(req.user._id, req.params.channelId);
    res.status(204).end();
  },

  async getUnreadCounts(req, res) {
    const counts = await messageService.getUnreadCounts(req.user._id, req.query.serverId);
    res.json({ counts });
  },

  async createMessage(req, res) {
    const message = await messageService.createMessage(req.user._id, req.params.channelId, req.body);
    broadcastMessage(req, "message:created", message);
    await broadcastUnreadUpdate(req, message);
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

    broadcastMessage(req, "message:created", message);
    await broadcastUnreadUpdate(req, message);
    res.status(201).json({ message });
  },

  async editMessage(req, res) {
    const message = await messageService.editMessage(req.user._id, req.params.messageId, req.body);
    broadcastMessage(req, "message:updated", message);
    res.json({ message });
  },

  async deleteMessage(req, res) {
    const result = await messageService.deleteMessage(req.user._id, req.params.messageId);
    req.app.get("io")?.to(`channel:${result.channelId}`).emit("message:deleted", {
      messageId: req.params.messageId
    });
    res.json(result);
  },

  async toggleReaction(req, res) {
    const message = await messageService.toggleReaction(req.user._id, req.params.messageId, req.body);
    broadcastMessage(req, "message:updated", message);
    res.json({ message });
  }
};
