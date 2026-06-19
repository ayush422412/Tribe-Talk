export const redisKeys = {
  rateLimit: (scope, identifier) => `rate:${scope}:${identifier}`,
  userSockets: (userId) => `presence:user:${userId}:sockets`,
  onlineUsers: "presence:users:online",
  serversForUser: (userId) => `cache:user:${userId}:servers`,
  channelsForServer: (serverId) => `cache:server:${serverId}:channels`
};
