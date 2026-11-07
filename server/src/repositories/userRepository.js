import { User } from "../models/User.js";

export const userRepository = {
  create(data) { return User.create(data); },
  findByEmail(email) { return User.findOne({ email }); },
  findByUsername(username) { return User.findOne({ username: username.toLowerCase() }); },
  findByUsernames(usernames) { return User.find({ username: { $in: usernames.map((username) => username.toLowerCase()) } }).select("-passwordHash"); },
  findById(id) { return User.findById(id).select("-passwordHash"); },
  updateById(id, data) { return User.findByIdAndUpdate(id, data, { new: true }).select("-passwordHash"); },
  updateNotificationPreferences(id, preferences) {
    return User.findByIdAndUpdate(id, { $set: { notificationPreferences: preferences } }, { new: true }).select("-passwordHash");
  },
  markWelcomeEmailSent(id) {
    return User.findOneAndUpdate({ _id: id, welcomeEmailSentAt: null }, { welcomeEmailSentAt: new Date() }, { new: true }).select("-passwordHash");
  }
};
