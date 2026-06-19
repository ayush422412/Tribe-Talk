import { User } from "../models/User.js";

export const userRepository = {
  create(data) {
    return User.create(data);
  },

  findByEmail(email) {
    return User.findOne({ email });
  },

  findByUsername(username) {
    return User.findOne({ username: username.toLowerCase() });
  },

  findById(id) {
    return User.findById(id).select("-passwordHash");
  },

  updateById(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true }).select("-passwordHash");
  }
};
