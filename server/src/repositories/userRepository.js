import { User } from "../models/User.js";

export const userRepository = {
  create(data) {
    return User.create(data);
  },

  findByEmail(email) {
    return User.findOne({ email });
  },

  findById(id) {
    return User.findById(id).select("-passwordHash");
  }
};
