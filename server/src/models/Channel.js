import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    server: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 40
    },
    type: {
      type: String,
      enum: ["text"],
      default: "text"
    },
    position: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export const Channel = mongoose.model("Channel", channelSchema);
