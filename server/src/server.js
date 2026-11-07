import { createServer } from "node:http";
import { env } from "./shared/config/env.js";
import { connectDatabase } from "./shared/config/database.js";
import { connectRedis } from "./shared/config/redis.js";
import { createApp } from "./app.js";
import { createSocketServer } from "./socket/socketServer.js";

await connectDatabase();
await connectRedis();

// Create HTTP server and attach Socket.IO server to it

const app = createApp();
const httpServer = createServer(app);

// Create and configure the Socket.IO server

app.set("io", createSocketServer(httpServer));

if (env.runWorkersInApi) {
  if (env.emailWorkerEnabled) {
    await import("./workers/emailWorker.js");
  }

  if (env.elasticsearchEnabled) {
    await import("./workers/messageSearchWorker.js");
  }
}

// Start the HTTP server

httpServer.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
