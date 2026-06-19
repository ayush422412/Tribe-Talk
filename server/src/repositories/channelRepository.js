import { Channel } from "../models/Channel.js";

export const channelRepository = {
  create(data) {
    return Channel.create(data);
  },

  findById(id) {
    return Channel.findById(id);
  },

  findByServerId(serverId) {
    return Channel.find({ server: serverId }).sort({ position: 1, createdAt: 1 });
  },

  updateById(id, data) {
    return Channel.findByIdAndUpdate(id, data, { new: true });
  },

  deleteById(id) {
    return Channel.findByIdAndDelete(id);
  },

  deleteByServerId(serverId) {
    return Channel.deleteMany({ server: serverId });
  }
};
