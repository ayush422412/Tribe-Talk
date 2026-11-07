import mongoose from "mongoose";
import { connectDatabase } from "../shared/config/database.js";
import { messageSearchQueue, enqueueMessageIndex } from "../queues/messageSearchQueue.js";
import { messageRepository } from "../repositories/messageRepository.js";
import { elasticsearchClient, isElasticsearchEnabled } from "../search/elasticsearchClient.js";

if (!isElasticsearchEnabled()) throw new Error("ELASTICSEARCH_ENABLED=true is required to reindex messages");
await connectDatabase();
await elasticsearchClient.ensureMessageIndex();
await elasticsearchClient.clearMessageIndex();

let lastId;
let queued = 0;
while (true) {
  const messages = await messageRepository.findReindexBatch(lastId, 500);
  if (messages.length === 0) break;
  for (const message of messages) {
    await enqueueMessageIndex(message);
    queued += 1;
  }
  lastId = messages[messages.length - 1]._id;
}

console.log(`Queued ${queued} messages for Elasticsearch reindexing.`);
await messageSearchQueue.close();
await mongoose.disconnect();
