import mongoose from "mongoose";

const notificationPreferencesSchema = new mongoose.Schema(
  {
    mentionEmails: { type: Boolean, default: true },
    mutedChannelIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }]
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 32 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    description: { type: String, default: "", maxlength: 280 },
    welcomeEmailSentAt: { type: Date, default: null },
    notificationPreferences: { type: notificationPreferencesSchema, default: () => ({}) }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
