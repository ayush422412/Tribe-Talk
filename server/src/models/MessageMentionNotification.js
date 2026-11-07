import mongoose from "mongoose";

const messageMentionNotificationSchema = new mongoose.Schema(
  {
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emailSentAt: { type: Date, default: null }
  },
  { timestamps: true }
);

messageMentionNotificationSchema.index({ message: 1, recipient: 1 }, { unique: true });

export const MessageMentionNotification = mongoose.model(
  "MessageMentionNotification",
  messageMentionNotificationSchema
);
