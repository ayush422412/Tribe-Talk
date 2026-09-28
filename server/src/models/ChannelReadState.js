import mongoose from "mongoose";

// Each user owns an independent read position for every channel they open.
const channelReadStateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    lastReadAt: { type: Date, default: () => new Date(0) }
  },
  { timestamps: true }
);

channelReadStateSchema.index({ user: 1, channel: 1 }, { unique: true });

export const ChannelReadState = mongoose.model("ChannelReadState", channelReadStateSchema);
