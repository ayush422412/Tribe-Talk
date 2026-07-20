import mongoose from "mongoose";

const serverMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ["owner", "admin", "moderator", "member"],
      default: "member"
    }
  },
  { _id: false }
);  

const serverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    iconUrl: {
      type: String,
      default: ""
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: {
      type: [serverMemberSchema],
      default: []
    }
  },
  { timestamps: true }
);

export const Server = mongoose.model("Server", serverSchema);
