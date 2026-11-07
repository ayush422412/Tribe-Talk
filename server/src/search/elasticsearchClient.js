import { env } from "../shared/config/env.js";
import { AppError } from "../shared/errors/AppError.js";

export function isElasticsearchEnabled() {
  return env.elasticsearchEnabled;
}

function getAuthorizationHeader() {
  if (!env.elasticsearchUsername && !env.elasticsearchPassword) return {};
  const credentials = Buffer.from(`${env.elasticsearchUsername}:${env.elasticsearchPassword}`).toString("base64");
  return { Authorization: `Basic ${credentials}` };
}

async function request(path, options = {}) {
  if (!isElasticsearchEnabled()) {
    throw new AppError("Elasticsearch search is not enabled", 503);
  }

  let response;
  try {
    response = await fetch(`${env.elasticsearchNode.replace(/\/$/, "")}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...getAuthorizationHeader(),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });
  } catch (error) {
    throw new AppError(`Elasticsearch is unavailable: ${error.message}`, 503);
  }

  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const reason = body?.error?.reason ?? body?.error?.root_cause?.[0]?.reason ?? response.statusText;
    throw new AppError(`Elasticsearch request failed: ${reason}`, 503);
  }

  return options.method === "HEAD" ? true : body;
}

export const elasticsearchClient = {
  request,

  async ensureMessageIndex() {
    const indexPath = `/${encodeURIComponent(env.elasticsearchMessageIndex)}`;
    const exists = await request(indexPath, { method: "HEAD", allowNotFound: true });
    if (exists) return;

    await request(indexPath, {
      method: "PUT",
      body: JSON.stringify({
        mappings: {
          properties: {
            messageId: { type: "keyword" },
            channelId: { type: "keyword" },
            serverId: { type: "keyword" },
            authorId: { type: "keyword" },
            authorUsername: { type: "keyword" },
            content: { type: "text" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
            syncVersion: { type: "long" }
          }
        }
      })
    });
  },

  indexMessage(document) {
    return request(`/${encodeURIComponent(env.elasticsearchMessageIndex)}/_doc/${document.messageId}`, {
      method: "PUT",
      body: JSON.stringify(document)
    });
  },

  async deleteMessage(messageId) {
    try {
      await request(`/${encodeURIComponent(env.elasticsearchMessageIndex)}/_doc/${messageId}`, { method: "DELETE" });
    } catch (error) {
      if (!/404/.test(error.message)) throw error;
    }
  },

  search(body) {
    return request(`/${encodeURIComponent(env.elasticsearchMessageIndex)}/_search`, {
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  clearMessageIndex() {
    return request(`/${encodeURIComponent(env.elasticsearchMessageIndex)}/_delete_by_query?conflicts=proceed`, {
      method: "POST",
      body: JSON.stringify({ query: { match_all: {} } })
    });
  }
};
