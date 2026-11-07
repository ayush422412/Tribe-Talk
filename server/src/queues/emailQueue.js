import { Queue } from "bullmq";
import { bullMqConnection } from "../shared/config/bullmq.js";

export const EMAIL_QUEUE_NAME = "email";
export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: bullMqConnection,
  defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 1000 }, removeOnComplete: { age: 86400, count: 1000 }, removeOnFail: { age: 604800, count: 5000 } }
});

export function enqueueWelcomeEmail({ userId, email, username }) { return emailQueue.add("welcome-email", { userId, email, username }, { jobId: `welcome-${userId}` }); }
export function enqueueFriendRequestEmail({ requestId, recipientEmail, senderName, friendRequestUrl }) { return emailQueue.add("friend-request-email", { requestId, recipientEmail, senderName, friendRequestUrl }, { jobId: `friend-request-${requestId}` }); }
export function enqueueMentionEmail({ messageId, recipientId, channelId }) { return emailQueue.add("mention-email", { messageId, recipientId, channelId }, { jobId: `mention-${messageId}-${recipientId}` }); }
