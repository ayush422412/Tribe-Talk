import { FriendRequest } from "../models/FriendRequest.js";
import { Conversation } from "../models/Conversation.js";

export const friendRepository = {
  createRequest(from, to) {
    return FriendRequest.create({ from, to });
  },

  findRequestBetween(userA, userB) {
    return FriendRequest.findOne({
      $or: [
        { from: userA, to: userB },
        { from: userB, to: userA }
      ]
    });
  },

  findRequestById(id) {
    return FriendRequest.findById(id).populate("from to", "username email avatarUrl description");
  },

  updateRequestStatus(id, status) {
    return FriendRequest.findByIdAndUpdate(id, { status }, { new: true }).populate(
      "from to",
      "username email avatarUrl description"
    );
  },

  findRequestsForUser(userId) {
    return FriendRequest.find({
      $or: [{ from: userId }, { to: userId }]
    })
      .populate("from to", "username email avatarUrl description")
      .sort({ updatedAt: -1 });
  },

  findAcceptedForUser(userId) {
    return FriendRequest.find({
      status: "accepted",
      $or: [{ from: userId }, { to: userId }]
    }).populate("from to", "username email avatarUrl description");
  },

  findConversation(participantIds) {
    return Conversation.findOne({
      participants: { $all: participantIds, $size: participantIds.length }
    }).populate("participants messages.author", "username email avatarUrl description");
  },

  createConversation(participantIds) {
    return Conversation.create({ participants: participantIds }).then((conversation) =>
      conversation.populate("participants messages.author", "username email avatarUrl description")
    );
  },

  appendDirectMessage(conversation, message) {
    conversation.messages.push(message);
    return conversation.save().then((savedConversation) =>
      savedConversation.populate("participants messages.author", "username email avatarUrl description")
    );
  }
};
