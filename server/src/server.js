import { createServer } from "node:http";
import { env } from "./shared/config/env.js";
import { connectDatabase } from "./shared/config/database.js";
import { connectRedis } from "./shared/config/redis.js";
import { createApp } from "./app.js";
import { createSocketServer } from "./socket/socketServer.js";

await connectDatabase();
await connectRedis();

const app = createApp();
const httpServer = createServer(app);

app.set("io", createSocketServer(httpServer));

httpServer.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
