import { emailQueue } from "../queues/emailQueue.js";
import { emailService } from "../services/emailService.js";

try {
  await emailQueue.waitUntilReady();
  await emailService.verifyConnection();
  console.log("Redis queue and SMTP connection are ready.");
} finally {
  await emailQueue.close();
}
