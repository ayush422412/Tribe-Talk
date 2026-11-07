import { messageSearchQueue } from "../queues/messageSearchQueue.js";

const jobs = await messageSearchQueue.getFailed(0, 999);
for (const job of jobs) await job.retry();
console.log(`Requeued ${jobs.length} failed message-search jobs.`);
await messageSearchQueue.close();
