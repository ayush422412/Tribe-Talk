import dotenv from "dotenv";

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  mongoUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/tribetalk"),
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  cookieName: process.env.COOKIE_NAME ?? "tribetalk_token",
  cookieSameSite: process.env.COOKIE_SAME_SITE ?? "lax",
  nodeEnv: process.env.NODE_ENV ?? "development",
  redisUrl: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  rateLimitWindowSeconds: Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60),
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 120),
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPassword: process.env.SMTP_PASSWORD ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "TribeTalk <no-reply@tribetalk.local>",
  runWorkersInApi: process.env.RUN_WORKERS_IN_API === "true",
  emailWorkerEnabled: process.env.EMAIL_WORKER_ENABLED === "true",
  elasticsearchEnabled: process.env.ELASTICSEARCH_ENABLED === "true",
  elasticsearchNode: process.env.ELASTICSEARCH_NODE ?? "http://127.0.0.1:9200",
  elasticsearchUsername: process.env.ELASTICSEARCH_USERNAME ?? "",
  elasticsearchPassword: process.env.ELASTICSEARCH_PASSWORD ?? "",
  elasticsearchMessageIndex: process.env.ELASTICSEARCH_MESSAGE_INDEX ?? "tribetalk_messages"
};
