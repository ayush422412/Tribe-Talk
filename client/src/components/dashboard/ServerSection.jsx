import { Shield, Trash2 } from "lucide-react";
import {
  useKickMemberMutation,
  useUpdateMemberRoleMutation
} from "../../api/server/serverApi.js";

export function ServerSection({ title, servers, currentUserId, editable = false }) {
  const [updateMemberRole] = useUpdateMemberRoleMutation();
  const [kickMember] = useKickMemberMutation();

  async function handleRoleChange(serverId, userId, role) {
    await updateMemberRole({ serverId, userId, role });
  }

  async function handleKickMember(serverId, userId) {
    await kickMember({ serverId, userId });
  }

  return (
    <section className="rounded-lg bg-gray-900 p-5">
      <h2 className="text-base font-bold">{title}</h2>
      <div className="mt-4 space-y-4">
        {servers.length === 0 && <p className="text-sm text-gray-500">No servers yet.</p>}
        {servers.map((server) => (
          <ServerCard
            key={server._id}
            server={server}
            currentUserId={currentUserId}
            editable={editable}
            onRoleChange={handleRoleChange}
            onKick={handleKickMember}
          />
        ))}
      </div>
    </section>
  );
}

function ServerCard({ server, currentUserId, editable, onRoleChange, onKick }) {
  return (
    <div className="rounded-md bg-gray-800 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-accent font-bold">
          {server.iconUrl ? (
            <img src={toImageUrl(server.iconUrl)} alt="" className="h-full w-full object-cover" />
          ) : (
            serverInitials(server.name)
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{server.name}</p>
          <p className="text-xs text-gray-500">ID: {server._id}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {server.members.map((member) => (
          <MemberRow
            key={member.user._id}
            serverId={server._id}
            member={member}
            currentUserId={currentUserId}
            editable={editable}
            onRoleChange={onRoleChange}
            onKick={onKick}
          />
        ))}
      </div>
    </div>
  );
}

function MemberRow({ serverId, member, currentUserId, editable, onRoleChange, onKick }) {
  const canEditMember = editable && member.user._id !== currentUserId && member.role !== "owner";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded bg-gray-900 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{member.user.username}</p>
        <p className="text-xs text-gray-500">
          {member.user.email} | ID: {member.user._id}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs capitalize text-gray-300">
          <Shield size={12} />
          {member.role}
        </span>
        {canEditMember && (
          <>
            <select
              value={member.role}
              onChange={(event) => onRoleChange(serverId, member.user._id, event.target.value)}
              className="h-8 rounded bg-gray-800 px-2 text-xs outline-none"
            >
              <option value="member">member</option>
              <option value="moderator">moderator</option>
              <option value="admin">admin</option>
            </select>
            <button
              title="Kick member"
              onClick={() => onKick(serverId, member.user._id)}
              className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-red-300"
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function serverInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function toImageUrl(url) {
  return url?.startsWith("/") ? `${(import.meta.env.VITE_API_URL ?? "http://localhost:5000/api").replace(/\/api$/, "")}${url}` : url;
}
