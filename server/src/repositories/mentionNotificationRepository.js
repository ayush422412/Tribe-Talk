import { MessageMentionNotification } from "../models/MessageMentionNotification.js";

export const mentionNotificationRepository = {
  ensure(messageId, recipientId) {
    return MessageMentionNotification.findOneAndUpdate(
      { message: messageId, recipient: recipientId },
      { $setOnInsert: { message: messageId, recipient: recipientId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  },
  findByMessageAndRecipient(messageId, recipientId) { return MessageMentionNotification.findOne({ message: messageId, recipient: recipientId }); },
  markEmailSent(notificationId) { return MessageMentionNotification.findOneAndUpdate({ _id: notificationId, emailSentAt: null }, { emailSentAt: new Date() }, { new: true }); }
};
