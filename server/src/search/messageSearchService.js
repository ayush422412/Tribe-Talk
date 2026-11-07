import { channelRepository } from "../repositories/channelRepository.js";
import { messageRepository } from "../repositories/messageRepository.js";
import { serverRepository } from "../repositories/serverRepository.js";
import { AppError } from "../shared/errors/AppError.js";
import { elasticsearchClient, isElasticsearchEnabled } from "./elasticsearchClient.js";

export const messageSearchService = {
  async search(userId, options) {
    if (!isElasticsearchEnabled()) {
      throw new AppError("Message search is not enabled. Configure Elasticsearch first.", 503);
    }

    const page = Math.max(Number(options.page) || 1, 1);
    const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 50);
    const { channelIds, serverIds } = await getAccessibleScope(userId);
    const requestedChannelId = options.channelId;

    if (requestedChannelId && !channelIds.includes(requestedChannelId)) {
      throw new AppError("You do not have access to this channel", 403);
    }

    const filters = [{ terms: { channelId: requestedChannelId ? [requestedChannelId] : channelIds } }];
    if (options.senderId) filters.push({ term: { authorId: options.senderId } });
    if (options.from || options.to) {
      filters.push({ range: { createdAt: { ...(options.from ? { gte: parseDate(options.from, "from") } : {}), ...(options.to ? { lte: parseDate(options.to, "to") } : {}) } } });
    }

    const queryText = options.q?.trim();
    const response = await elasticsearchClient.search({
      from: (page - 1) * limit,
      size: limit,
      track_total_hits: true,
      query: {
        bool: {
          must: queryText ? [{ simple_query_string: { query: queryText, fields: ["content^2", "authorUsername"], default_operator: "and" } }] : [{ match_all: {} }],
          filter: filters
        }
      },
      sort: queryText ? [{ _score: "desc" }, { createdAt: "desc" }] : [{ createdAt: "desc" }]
    });

    const hitIds = response.hits.hits.map((hit) => hit._source.messageId);
    const messages = await messageRepository.findByIds(hitIds);
    const messagesById = new Map(messages.map((message) => [message._id.toString(), message]));
    const hitById = new Map(response.hits.hits.map((hit) => [hit._source.messageId, hit._source]));

    return {
      messages: hitIds.map((id) => {
        const message = messagesById.get(id);
        if (!message) return null;

        return { ...message.toObject(), serverId: hitById.get(id)?.serverId };
      }).filter(Boolean),
      pageInfo: {
        page,
        limit,
        total: typeof response.hits.total === "number" ? response.hits.total : response.hits.total?.value ?? 0,
        totalPages: Math.ceil((typeof response.hits.total === "number" ? response.hits.total : response.hits.total?.value ?? 0) / limit),
        searchableServerIds: serverIds
      }
    };
  }
};

async function getAccessibleScope(userId) {
  const servers = await serverRepository.findByUserId(userId);
  const serverIds = servers.map((server) => server._id.toString());
  if (serverIds.length === 0) return { serverIds: [], channelIds: [] };
  const channels = await channelRepository.findByServerIds(serverIds);
  return { serverIds, channelIds: channels.map((channel) => channel._id.toString()) };
}

function parseDate(value, name) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) throw new AppError(`Invalid ${name} date`, 400);
  return date.toISOString();
}
