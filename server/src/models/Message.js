import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      required: true
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    attachments: {
      type: [attachmentSchema],
      default: []
    },
    editedAt: {
      type: Date,
      default: null
    },
    reactions: {
      type: [reactionSchema],
      default: []
    }
  },
  { timestamps: true }
);

messageSchema.index({ channel: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
