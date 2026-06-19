import { friendRepository } from "../repositories/friendRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { AppError } from "../shared/errors/AppError.js";

function friendFromRequest(request, userId) {
  const fromId = request.from._id.toString();
  return fromId === userId.toString() ? request.to : request.from;
}

export const friendService = {
  async sendRequest(userId, { username }) {
    if (!username) {
      throw new AppError("Username is required", 400);
    }

    const targetUser = await userRepository.findByUsername(username);

    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    if (targetUser._id.toString() === userId.toString()) {
      throw new AppError("You cannot send a friend request to yourself", 400);
    }

    const existingRequest = await friendRepository.findRequestBetween(userId, targetUser._id);

    if (existingRequest) {
      throw new AppError("Friend request already exists", 409);
    }

    return friendRepository.createRequest(userId, targetUser._id);
  },

  async getFriendOverview(userId) {
    const requests = await friendRepository.findRequestsForUser(userId);
    const acceptedRequests = requests.filter((request) => request.status === "accepted");

    return {
      friends: acceptedRequests.map((request) => friendFromRequest(request, userId)),
      incomingRequests: requests.filter(
        (request) => request.status === "pending" && request.to._id.toString() === userId.toString()
      ),
      outgoingRequests: requests.filter(
        (request) => request.status === "pending" && request.from._id.toString() === userId.toString()
      )
    };
  },

  async respondToRequest(userId, requestId, status) {
    if (!["accepted", "rejected"].includes(status)) {
      throw new AppError("Invalid friend request status", 400);
    }

    const request = await friendRepository.findRequestById(requestId);

    if (!request) {
      throw new AppError("Friend request not found", 404);
    }

    if (request.to._id.toString() !== userId.toString()) {
      throw new AppError("Only the receiver can respond to this friend request", 403);
    }

    return friendRepository.updateRequestStatus(requestId, status);
  },

  async getConversation(userId, friendId) {
    await this.ensureFriends(userId, friendId);
    const participantIds = [userId, friendId].sort();
    const conversation = await friendRepository.findConversation(participantIds);

    if (conversation) {
      return conversation;
    }

    return friendRepository.createConversation(participantIds);
  },

  async sendDirectMessage(userId, friendId, { content }) {
    if (!content?.trim()) {
      throw new AppError("Message content is required", 400);
    }

    const conversation = await this.getConversation(userId, friendId);
    return friendRepository.appendDirectMessage(conversation, {
      author: userId,
      content: content.trim()
    });
  },

  async ensureFriends(userId, friendId) {
    const request = await friendRepository.findRequestBetween(userId, friendId);

    if (!request || request.status !== "accepted") {
      throw new AppError("You can only DM accepted friends", 403);
    }
  }
};
