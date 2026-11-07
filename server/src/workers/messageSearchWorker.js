import mongoose from "mongoose";
import { Worker } from "bullmq";
import { connectDatabase } from "../shared/config/database.js";
import { bullMqConnection } from "../shared/config/bullmq.js";
import { logError } from "../shared/utils/logger.js";
import { MESSAGE_SEARCH_QUEUE_NAME } from "../queues/messageSearchQueue.js";
import { channelRepository } from "../repositories/channelRepository.js";
import { messageRepository } from "../repositories/messageRepository.js";
import { elasticsearchClient, isElasticsearchEnabled } from "../search/elasticsearchClient.js";

if (!isElasticsearchEnabled()) {
  throw new Error("ELASTICSEARCH_ENABLED=true is required to start the message search worker");
}

await connectDatabase();
await elasticsearchClient.ensureMessageIndex();
console.log("Elasticsearch message index is ready");

const worker = new Worker(MESSAGE_SEARCH_QUEUE_NAME, processSearchJob, { connection: bullMqConnection, concurrency: 10 });
worker.on("completed", (job, result) => console.log("Search sync job completed", { jobId: job.id, ...result }));
worker.on("failed", (job, error) => logError("Search sync job failed", error, { jobId: job?.id, jobName: job?.name, attemptsMade: job?.attemptsMade }));

async function processSearchJob(job) {
  if (job.name === "index-message") return indexMessage(job.data.messageId, job.data.version);
  if (job.name === "delete-message") return deleteMessage(job.data.messageId);
  throw new Error(`Unsupported search job: ${job.name}`);
}

async function indexMessage(messageId, queuedVersion) {
  const message = await messageRepository.findById(messageId);
  if (!message) return deleteMessage(messageId);

  const currentVersion = new Date(message.updatedAt ?? message.createdAt).getTime();
  if (currentVersion < queuedVersion) return { skipped: "stale-index-job" };

  const channel = await channelRepository.findById(message.channel);
  if (!channel) return deleteMessage(messageId);

  await elasticsearchClient.indexMessage({
    messageId: message._id.toString(),
    channelId: message.channel.toString(),
    serverId: channel.server.toString(),
    authorId: message.author._id.toString(),
    authorUsername: message.author.username,
    content: message.content ?? "",
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
    syncVersion: currentVersion
  });

  return { indexed: messageId, syncVersion: currentVersion };
}

async function deleteMessage(messageId) {
  await elasticsearchClient.deleteMessage(messageId);
  return { deleted: messageId };
}

async function shutdown(signal) {
  console.log(`${signal} received. Closing search worker...`);
  await worker.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
