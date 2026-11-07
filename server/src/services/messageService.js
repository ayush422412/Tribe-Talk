import { channelRepository } from "../repositories/channelRepository.js";
import { messageRepository } from "../repositories/messageRepository.js";
import { channelReadStateRepository } from "../repositories/channelReadStateRepository.js";
import { serverService } from "./serverService.js";
import { requirePermission, requireServerMember } from "./permissionService.js";
import { AppError } from "../shared/errors/AppError.js";
import { enqueueMentionEmail } from "../queues/emailQueue.js";
import { enqueueMessageDelete, enqueueMessageIndex } from "../queues/messageSearchQueue.js";
import { mentionNotificationRepository } from "../repositories/mentionNotificationRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { isElasticsearchEnabled } from "../search/elasticsearchClient.js";
import { logError } from "../shared/utils/logger.js";

export const messageService = {

  // Get messages for a specific channel, ensuring the user is a member of the server and utilizing pagination options
  async getChannelMessages(userId, channelId, options = {}) {
    const channel = await channelRepository.findById(channelId);

    if (!channel) {
      throw new AppError("Channel not found", 404);
    }

    const server = await serverService.getServer(userId, channel.server);
    requireServerMember(server, userId);

    const limit = Math.min(Number(options.limit) || 30, 50);
    const readState = await channelReadStateRepository.findByUserAndChannel(userId, channelId);
    // A user opening a channel for the first time starts from the latest messages, not its entire history.
    const lastReadAt = readState?.lastReadAt;
    const unreadCount = lastReadAt
      ? await messageRepository.countAfter(channelId, lastReadAt, userId)
      : 0;
    const firstUnreadMessage = unreadCount > 0
      ? await messageRepository.findFirstAfter(channelId, lastReadAt, userId)
      : null;
    const before = options.before;
    const after = options.after;
    const initialUnreadPage = !before && firstUnreadMessage;
    const messages = after
      ? await messageRepository.findAfter(channelId, new Date(after), limit)
      : initialUnreadPage
      ? await messageRepository.findFromDate(channelId, firstUnreadMessage.createdAt, limit)
      : await messageRepository.findByChannelId(channelId, { limit, before });
    const chronologicalMessages = initialUnreadPage || after ? messages : messages.reverse();
    const hasOlder = chronologicalMessages.length > 0 && await messageRepository.hasBefore(
      channelId,
      chronologicalMessages[0].createdAt
    );
    const hasNewer = chronologicalMessages.length > 0 && await messageRepository.hasAfter(
      channelId,
      chronologicalMessages[chronologicalMessages.length - 1].createdAt
    );

    return {
      messages: chronologicalMessages,
      pageInfo: {
        hasOlder: Boolean(hasOlder),
        nextBefore: chronologicalMessages[0]?.createdAt?.toISOString() ?? null,
        hasNewer: Boolean(hasNewer),
        nextAfter: chronologicalMessages[chronologicalMessages.length - 1]?.createdAt?.toISOString() ?? null,
        unreadCount,
        firstUnreadMessageId: firstUnreadMessage?._id?.toString() ?? null
      }
    };
  },

  async markChannelRead(userId, channelId) {
    const channel = await channelRepository.findById(channelId);
    if (!channel) throw new AppError("Channel not found", 404);

    const server = await serverService.getServer(userId, channel.server);
    requireServerMember(server, userId);
    return channelReadStateRepository.markRead(userId, channelId);
  },

  async getUnreadCounts(userId, serverId) {
    const server = await serverService.getServer(userId, serverId);
    requireServerMember(server, userId);
    const channels = await channelRepository.findByServerId(serverId);
    // Existing accounts receive a baseline once; messages sent after that become unread.
    await channelReadStateRepository.initializeForChannelStates(userId, channels.map((channel) => channel._id));
    const readStates = await channelReadStateRepository.findByUserAndChannels(userId, channels.map((channel) => channel._id));
    const readAtByChannel = new Map(readStates.map((state) => [state.channel.toString(), state.lastReadAt]));
    const counts = await Promise.all(channels.map(async (channel) => ({
      channelId: channel._id.toString(),
      count: readAtByChannel.has(channel._id.toString())
        ? await messageRepository.countAfter(channel._id, readAtByChannel.get(channel._id.toString()), userId)
        : 0
    })));
    return counts;
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

    const message = await messageRepository.create({
      channel: channelId,
      author: userId,
      content: content?.trim() ?? "",
      attachments
    });

    scheduleMessageSideEffects(message, server);
    return message;
  },

  async getChannelMemberIds(userId, channelId) {
    const channel = await channelRepository.findById(channelId);
    if (!channel) throw new AppError("Channel not found", 404);

    const server = await serverService.getServer(userId, channel.server);
    return server.members.map((member) => (member.user?._id ?? member.user).toString());
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

    const updatedMessage = await messageRepository.updateById(messageId, {
      content,
      editedAt: new Date()
    });
    const channel = await channelRepository.findById(updatedMessage.channel);
    const server = channel ? await serverService.getServer(userId, channel.server) : null;
    if (server) scheduleMessageSideEffects(updatedMessage, server);
    return updatedMessage;
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
    if (isElasticsearchEnabled()) {
      void enqueueMessageDelete({ messageId, deletedAt: new Date() }).catch((error) => {
        logError("Unable to enqueue message deletion for Elasticsearch", error, { messageId });
      });
    }
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

function scheduleMessageSideEffects(message, server) {
  if (isElasticsearchEnabled()) {
    void enqueueMessageIndex(message).catch((error) => {
      logError("Unable to enqueue message indexing", error, { messageId: message._id.toString() });
    });
  }

  void queueMentionNotifications(message, server).catch((error) => {
    logError("Unable to queue mention notifications", error, { messageId: message._id.toString() });
  });
}

async function queueMentionNotifications(message, server) {
  const usernames = [...new Set([...String(message.content ?? "").matchAll(/@([a-z0-9_]{3,32})\b/gi)].map((match) => match[1].toLowerCase()))];
  if (usernames.length === 0) return;

  const members = new Set(server.members.map((member) => (member.user?._id ?? member.user).toString()));
  const users = await userRepository.findByUsernames(usernames);

  for (const user of users) {
    const userId = user._id.toString();
    const muted = user.notificationPreferences?.mutedChannelIds?.some((channelId) => channelId.toString() === message.channel.toString());
    if (!members.has(userId) || userId === message.author._id.toString() || user.notificationPreferences?.mentionEmails === false || muted) continue;

    await mentionNotificationRepository.ensure(message._id, user._id);
    void enqueueMentionEmail({ messageId: message._id.toString(), recipientId: userId, channelId: message.channel.toString() }).catch((error) => {
      logError("Unable to enqueue mention email", error, { messageId: message._id.toString(), recipientId: userId });
    });
  }
}
