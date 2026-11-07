import mongoose from "mongoose";
import { Worker } from "bullmq";
import { connectDatabase } from "../shared/config/database.js";
import { bullMqConnection } from "../shared/config/bullmq.js";
import { logError } from "../shared/utils/logger.js";
import { EMAIL_QUEUE_NAME } from "../queues/emailQueue.js";
import { friendRepository } from "../repositories/friendRepository.js";
import { mentionNotificationRepository } from "../repositories/mentionNotificationRepository.js";
import { messageRepository } from "../repositories/messageRepository.js";
import { channelRepository } from "../repositories/channelRepository.js";
import { serverRepository } from "../repositories/serverRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { emailService } from "../services/emailService.js";
import { env } from "../shared/config/env.js";

await connectDatabase(); await emailService.verifyConnection(); console.log("SMTP connection verified");
const worker = new Worker(EMAIL_QUEUE_NAME, processEmailJob, { connection: bullMqConnection, concurrency: 5 });
worker.on("completed", (job, result) => console.log("Email job completed", { jobId: job.id, ...result }));
worker.on("failed", (job, error) => logError("Email job failed", error, { jobId: job?.id, jobName: job?.name, attemptsMade: job?.attemptsMade }));
async function processEmailJob(job) {
  if (job.name === "welcome-email") return processWelcomeEmail(job);
  if (job.name === "friend-request-email") return processFriendRequestEmail(job);
  if (job.name === "mention-email") return processMentionEmail(job);
  throw new Error(`Unsupported email job: ${job.name}`);
}
async function processWelcomeEmail(job) { const user = await userRepository.findById(job.data.userId); if (!user) return { skipped: "user-not-found" }; if (user.welcomeEmailSentAt) return { skipped: "already-sent" }; const delivery = await emailService.sendWelcomeEmail({ email: user.email, username: user.username }); await userRepository.markWelcomeEmailSent(user._id); return delivery; }
async function processFriendRequestEmail(job) { const request = await friendRepository.findRequestById(job.data.requestId); if (!request) return { skipped: "request-not-found" }; if (request.status !== "pending") return { skipped: "request-already-handled" }; if (request.notificationEmailSentAt) return { skipped: "already-sent" }; const delivery = await emailService.sendFriendRequestEmail({ recipientEmail: request.to.email, senderName: request.from.username, friendRequestUrl: job.data.friendRequestUrl }); await friendRepository.markNotificationEmailSent(request._id); return delivery; }
async function processMentionEmail(job) {
  const notification = await mentionNotificationRepository.findByMessageAndRecipient(job.data.messageId, job.data.recipientId);
  if (!notification || notification.emailSentAt) return { skipped: "already-sent-or-missing" };
  const [message, recipient, channel] = await Promise.all([messageRepository.findById(job.data.messageId), userRepository.findById(job.data.recipientId), channelRepository.findById(job.data.channelId)]);
  if (!message || !recipient || !channel) return { skipped: "message-recipient-or-channel-missing" };
  const server = await serverRepository.findById(channel.server);
  const isMember = server?.members?.some((member) => (member.user?._id ?? member.user).toString() === recipient._id.toString());
  const muted = recipient.notificationPreferences?.mutedChannelIds?.some((id) => id.toString() === channel._id.toString());
  if (!isMember || muted || recipient.notificationPreferences?.mentionEmails === false || message.author._id.toString() === recipient._id.toString()) return { skipped: "notification-preference-or-membership" };
  const messageUrl = new URL(`/chat?channel=${channel._id}&message=${message._id}`, env.clientUrl).toString();
  const delivery = await emailService.sendMentionEmail({ recipientEmail: recipient.email, senderName: message.author.username, content: message.content, messageUrl });
  await mentionNotificationRepository.markEmailSent(notification._id);
  return delivery;
}
async function shutdown(signal) { console.log(`${signal} received. Closing email worker...`); await worker.close(); await mongoose.disconnect(); process.exit(0); }
process.once("SIGINT", () => void shutdown("SIGINT")); process.once("SIGTERM", () => void shutdown("SIGTERM"));
