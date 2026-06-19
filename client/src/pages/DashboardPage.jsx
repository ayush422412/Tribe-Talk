import { ArrowLeft, MessageSquare, Shield, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useKickMemberMutation, useUpdateMemberRoleMutation } from "../entities/server/serverApi.js";
import { useGetDashboardQuery, useUpdateProfileMutation } from "../entities/user/userApi.js";
import {
  useGetConversationQuery,
  useGetFriendsQuery,
  useRespondFriendRequestMutation,
  useSendDirectMessageMutation,
  useSendFriendRequestMutation
} from "../entities/friend/friendApi.js";
import { Button } from "../shared/ui/Button.jsx";
import { Input } from "../shared/ui/Input.jsx";

function serverInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardPage() {
  const currentUser = useSelector((state) => state.auth.user);
  const { data, isLoading } = useGetDashboardQuery();
  const { data: friendData } = useGetFriendsQuery();
  const [updateProfile, profileState] = useUpdateProfileMutation();
  const [updateMemberRole] = useUpdateMemberRoleMutation();
  const [kickMember] = useKickMemberMutation();
  const [sendFriendRequest, friendRequestState] = useSendFriendRequestMutation();
  const [respondFriendRequest] = useRespondFriendRequestMutation();
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [sendDirectMessage] = useSendDirectMessageMutation();
  const { data: conversationData } = useGetConversationQuery(selectedFriendId, {
    skip: !selectedFriendId
  });
  const [profileForm, setProfileForm] = useState({
    username: "",
    avatarUrl: "",
    description: ""
  });
  const [friendUsername, setFriendUsername] = useState("");
  const [dmContent, setDmContent] = useState("");

  useEffect(() => {
    if (data?.user) {
      setProfileForm({
        username: data.user.username ?? "",
        avatarUrl: data.user.avatarUrl ?? "",
        description: data.user.description ?? ""
      });
    }
  }, [data]);

  const ownedServers = data?.ownedServers ?? [];
  const joinedServers = data?.joinedServers ?? [];
  const selectedFriend = useMemo(
    () => friendData?.friends?.find((friend) => friend._id === selectedFriendId),
    [friendData, selectedFriendId]
  );

  async function handleProfileSubmit(event) {
    event.preventDefault();
    await updateProfile(profileForm).unwrap();
  }

  async function handleFriendSubmit(event) {
    event.preventDefault();
    await sendFriendRequest({ username: friendUsername }).unwrap();
    setFriendUsername("");
  }

  async function handleDmSubmit(event) {
    event.preventDefault();

    if (!dmContent.trim() || !selectedFriendId) {
      return;
    }

    await sendDirectMessage({ friendId: selectedFriendId, content: dmContent }).unwrap();
    setDmContent("");
  }

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-300">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="flex h-14 items-center justify-between border-b border-gray-800 px-5">
        <h1 className="text-lg font-bold">Dashboard</h1>
        <Link className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white" to="/">
          <ArrowLeft size={16} />
          Back to Chat
        </Link>
      </header>

      <div className="grid gap-5 p-5 xl:grid-cols-[360px_1fr_420px]">
        <section className="rounded-lg bg-gray-900 p-5">
          <h2 className="text-base font-bold">My Profile</h2>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-accent text-xl font-bold">
              {profileForm.avatarUrl ? (
                <img src={profileForm.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                profileForm.username?.[0]?.toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{currentUser?.email}</p>
              <p className="text-xs text-gray-500">ID: {currentUser?.id}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
            <Input
              label="Unique username"
              value={profileForm.username}
              onChange={(event) => setProfileForm({ ...profileForm, username: event.target.value })}
            />
            <Input
              label="Photo URL"
              value={profileForm.avatarUrl}
              onChange={(event) => setProfileForm({ ...profileForm, avatarUrl: event.target.value })}
            />
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                Description
              </span>
              <textarea
                value={profileForm.description}
                onChange={(event) => setProfileForm({ ...profileForm, description: event.target.value })}
                className="min-h-24 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm outline-none focus:border-accent"
                maxLength={280}
              />
            </label>
            {profileState.error && (
              <p className="text-sm text-red-300">{profileState.error.data?.message}</p>
            )}
            <Button disabled={profileState.isLoading}>Save Profile</Button>
          </form>
        </section>

        <section className="space-y-5">
          <ServerSection
            title="Owned Servers"
            servers={ownedServers}
            currentUserId={currentUser?.id}
            onRoleChange={(serverId, userId, role) => updateMemberRole({ serverId, userId, role })}
            onKick={(serverId, userId) => kickMember({ serverId, userId })}
            editable
          />
          <ServerSection title="Joined Servers" servers={joinedServers} currentUserId={currentUser?.id} />
        </section>

        <section className="rounded-lg bg-gray-900 p-5">
          <h2 className="text-base font-bold">Friends & DMs</h2>
          <form onSubmit={handleFriendSubmit} className="mt-4 flex gap-2">
            <input
              value={friendUsername}
              onChange={(event) => setFriendUsername(event.target.value)}
              placeholder="Send request by username"
              className="h-10 min-w-0 flex-1 rounded-md bg-gray-950 px-3 text-sm outline-none"
            />
            <Button disabled={friendRequestState.isLoading || !friendUsername.trim()}>Add</Button>
          </form>
          {friendRequestState.error && (
            <p className="mt-2 text-sm text-red-300">{friendRequestState.error.data?.message}</p>
          )}

          <h3 className="mt-6 text-xs font-bold uppercase text-gray-400">Incoming Requests</h3>
          <div className="mt-2 space-y-2">
            {(friendData?.incomingRequests ?? []).map((request) => (
              <div key={request._id} className="flex items-center justify-between rounded bg-gray-800 p-2">
                <span className="text-sm">{request.from.username}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => respondFriendRequest({ requestId: request._id, status: "accepted" })}
                    className="text-xs text-emerald-300"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondFriendRequest({ requestId: request._id, status: "rejected" })}
                    className="text-xs text-red-300"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3 className="mt-6 text-xs font-bold uppercase text-gray-400">Friends</h3>
          <div className="mt-2 space-y-2">
            {(friendData?.friends ?? []).map((friend) => (
              <button
                key={friend._id}
                onClick={() => setSelectedFriendId(friend._id)}
                className={`flex w-full items-center gap-2 rounded p-2 text-left text-sm ${
                  selectedFriendId === friend._id ? "bg-accent" : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <MessageSquare size={16} />
                <span>{friend.username}</span>
              </button>
            ))}
          </div>

          {selectedFriend && (
            <div className="mt-5 border-t border-gray-800 pt-4">
              <h3 className="font-semibold">DM with {selectedFriend.username}</h3>
              <div className="mt-3 max-h-72 space-y-3 overflow-y-auto rounded bg-gray-950 p-3">
                {(conversationData?.conversation?.messages ?? []).map((message) => (
                  <div key={message._id} className="text-sm">
                    <span className="font-semibold text-gray-300">{message.author.username}: </span>
                    <span className="text-gray-100">{message.content}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleDmSubmit} className="mt-3 flex gap-2">
                <input
                  value={dmContent}
                  onChange={(event) => setDmContent(event.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-md bg-gray-950 px-3 text-sm outline-none"
                  placeholder="Send a direct message"
                />
                <Button disabled={!dmContent.trim()}>Send</Button>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ServerSection({ title, servers, currentUserId, editable = false, onRoleChange, onKick }) {
  return (
    <section className="rounded-lg bg-gray-900 p-5">
      <h2 className="text-base font-bold">{title}</h2>
      <div className="mt-4 space-y-4">
        {servers.length === 0 && <p className="text-sm text-gray-500">No servers yet.</p>}
        {servers.map((server) => (
          <div key={server._id} className="rounded-md bg-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-accent font-bold">
                {server.iconUrl ? (
                  <img src={server.iconUrl} alt="" className="h-full w-full object-cover" />
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
                <div
                  key={member.user._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded bg-gray-900 px-3 py-2"
                >
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
                    {editable && member.user._id !== currentUserId && member.role !== "owner" && (
                      <>
                        <select
                          value={member.role}
                          onChange={(event) => onRoleChange(server._id, member.user._id, event.target.value)}
                          className="h-8 rounded bg-gray-800 px-2 text-xs outline-none"
                        >
                          <option value="member">member</option>
                          <option value="moderator">moderator</option>
                          <option value="admin">admin</option>
                        </select>
                        <button
                          title="Kick member"
                          onClick={() => onKick(server._id, member.user._id)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-red-300"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
