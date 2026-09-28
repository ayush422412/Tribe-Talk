import { ChannelReadState } from "../models/ChannelReadState.js";

export const channelReadStateRepository = {
  findByUserAndChannel(userId, channelId) {
    return ChannelReadState.findOne({ user: userId, channel: channelId });
  },

  findByUserAndChannels(userId, channelIds) {
    return ChannelReadState.find({ user: userId, channel: { $in: channelIds } });
  },

  markRead(userId, channelId) {
    return ChannelReadState.findOneAndUpdate(
      { user: userId, channel: channelId },
      { $set: { lastReadAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  },

  initializeForUsers(channelId, userIds) {
    if (userIds.length === 0) return Promise.resolve();

    return ChannelReadState.bulkWrite(userIds.map((userId) => ({
      updateOne: {
        filter: { user: userId, channel: channelId },
        update: { $setOnInsert: { lastReadAt: new Date() } },
        upsert: true
      }
    })));
  },

  initializeForChannelStates(userId, channelIds) {
    return Promise.all(channelIds.map((channelId) => this.initializeForUsers(channelId, [userId])));
  },

  deleteByChannelId(channelId) {
    return ChannelReadState.deleteMany({ channel: channelId });
  }
};
