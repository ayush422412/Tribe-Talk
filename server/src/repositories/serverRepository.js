import { Server } from "../models/Server.js";

export const serverRepository = {
  create(data) {
    return Server.create(data);
  },

  findById(id) {
    return Server.findById(id).populate("members.user", "username email avatarUrl");
  },

  findByUserId(userId) {
    return Server.find({ "members.user": userId }).sort({ updatedAt: -1 });
  },

  updateById(id, data) {
    return Server.findByIdAndUpdate(id, data, { new: true });
  },

  deleteById(id) {
    return Server.findByIdAndDelete(id);
  },

  addMember(serverId, member) {
    return Server.findByIdAndUpdate(
      serverId,
      { $addToSet: { members: member } },
      { new: true }
    );
  },

  removeMember(serverId, userId) {
    return Server.findByIdAndUpdate(
      serverId,
      { $pull: { members: { user: userId } } },
      { new: true }
    );
  }
};
