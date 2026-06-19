import { Message } from "../models/Message.js";

export const messageRepository = {
  create(data) {
    return Message.create(data).then((message) =>
      message.populate("author", "username email avatarUrl")
    );
  },

  findById(id) {
    return Message.findById(id).populate("author", "username email avatarUrl");
  },

  findByChannelId(channelId, { limit, before }) {
    const query = { channel: channelId };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    return Message.find(query)
      .populate("author", "username email avatarUrl")
      .sort({ createdAt: -1 })
      .limit(limit);
  },

  updateById(id, data) {
    return Message.findByIdAndUpdate(id, data, { new: true }).populate(
      "author",
      "username email avatarUrl"
    );
  },

  save(message) {
    return message.save().then((savedMessage) =>
      savedMessage.populate("author", "username email avatarUrl")
    );
  },

  deleteById(id) {
    return Message.findByIdAndDelete(id);
  },

  deleteByChannelId(channelId) {
    return Message.deleteMany({ channel: channelId });
  }
};
