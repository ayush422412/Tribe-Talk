import { channelRepository } from "../repositories/channelRepository.js";
import { messageRepository } from "../repositories/messageRepository.js";
import { serverService } from "./serverService.js";
import { requirePermission, requireServerMember } from "./permissionService.js";
import { AppError } from "../shared/errors/AppError.js";

export const messageService = {
  async getChannelMessages(userId, channelId, options = {}) {
    const channel = await channelRepository.findById(channelId);

    if (!channel) {
      throw new AppError("Channel not found", 404);
    }

    const server = await serverService.getServer(userId, channel.server);
    requireServerMember(server, userId);

    const limit = Math.min(Number(options.limit) || 30, 50);
    const messages = await messageRepository.findByChannelId(channelId, {
      limit,
      before: options.before
    });

    return messages.reverse();
  },

  async createMessage(userId, channelId, { content, attachments = [] }) {
    const channel = await channelRepository.findById(channelId);

    if (!channel) {
      throw new AppError("Channel not found", 404);
    }

    const server = await serverService.getServer(userId, channel.server);
    requirePermission(server, userId, "send_messages");

    const hasContent = Boolean(content?.trim());
    const hasAttachments = attachments.length > 0;

    if (!hasContent && !hasAttachments) {
      throw new AppError("Message content or file attachment is required", 400);
    }

    return messageRepository.create({
      channel: channelId,
      author: userId,
      content: content?.trim() ?? "",
      attachments
    });
  },

  async editMessage(userId, messageId, { content }) {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    if (message.author._id.toString() !== userId.toString()) {
      throw new AppError("You can only edit your own messages", 403);
    }

    if (!content || content.trim().length === 0) {
      throw new AppError("Message content is required", 400);
    }

    return messageRepository.updateById(messageId, {
      content,
      editedAt: new Date()
    });
  },

  async deleteMessage(userId, messageId) {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    const channel = await channelRepository.findById(message.channel);
    const server = await serverService.getServer(userId, channel.server);
    const isAuthor = message.author._id.toString() === userId.toString();

    if (!isAuthor) {
      requirePermission(server, userId, "delete_messages");
    }

    await messageRepository.deleteById(messageId);
    return { deleted: true, channelId: message.channel.toString() };
  },

  async toggleReaction(userId, messageId, { emoji }) {
    if (!emoji || emoji.trim().length === 0) {
      throw new AppError("Emoji is required", 400);
    }

    const message = await messageRepository.findById(messageId);

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    const channel = await channelRepository.findById(message.channel);
    const server = await serverService.getServer(userId, channel.server);
    requireServerMember(server, userId);

    const normalizedEmoji = emoji.trim();
    const reaction = message.reactions.find((item) => item.emoji === normalizedEmoji);

    if (!reaction) {
      message.reactions.push({ emoji: normalizedEmoji, users: [userId] });
      return messageRepository.save(message);
    }

    const hasReacted = reaction.users.some((reactionUserId) => reactionUserId.toString() === userId.toString());

    if (hasReacted) {
      reaction.users = reaction.users.filter(
        (reactionUserId) => reactionUserId.toString() !== userId.toString()
      );
    } else {
      reaction.users.push(userId);
    }

    message.reactions = message.reactions.filter((item) => item.users.length > 0);
    return messageRepository.save(message);
  }
};
