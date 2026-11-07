import { Queue } from "bullmq";
import { bullMqConnection } from "../shared/config/bullmq.js";

export const MESSAGE_SEARCH_QUEUE_NAME = "message-search";

export const messageSearchQueue = new Queue(MESSAGE_SEARCH_QUEUE_NAME, {
  connection: bullMqConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { age: 60 * 60 * 24, count: 5000 },
    removeOnFail: { age: 60 * 60 * 24 * 7, count: 5000 }
  }
});

export function enqueueMessageIndex(message) {
  const version = new Date(message.updatedAt ?? message.createdAt).getTime();
  return messageSearchQueue.add(
    "index-message",
    { messageId: message._id.toString(), version },
    { jobId: `index-${message._id}-${version}` }
  );
}

export function enqueueMessageDelete({ messageId, deletedAt = new Date() }) {
  const version = new Date(deletedAt).getTime();
  return messageSearchQueue.add(
    "delete-message",
    { messageId: messageId.toString(), version },
    { jobId: `delete-${messageId}-${version}` }
  );
}
