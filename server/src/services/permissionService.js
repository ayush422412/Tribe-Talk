import { AppError } from "../shared/errors/AppError.js";

const rolePermissions = {
  owner: ["manage_server", "manage_channels", "manage_members", "send_messages", "delete_messages"],
  admin: ["manage_server", "manage_channels", "manage_members", "send_messages", "delete_messages"],
  moderator: ["manage_channels", "send_messages", "delete_messages"],
  member: ["send_messages"]
};

export function getMember(server, userId) {
  return server.members.find((member) => {
    const memberUserId = member.user?._id ?? member.user;
    return memberUserId.toString() === userId.toString();
  });
}

export function requireServerMember(server, userId) {
  const member = getMember(server, userId);

  if (!member) {
    throw new AppError("You are not a member of this server", 403);
  }

  return member;
}

export function requirePermission(server, userId, permission) {
  const member = requireServerMember(server, userId);
  const permissions = rolePermissions[member.role] ?? [];

  if (!permissions.includes(permission)) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  return member;
}
