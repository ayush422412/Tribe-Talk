import { Copy, Hash, LogOut, Pencil, Plus, Settings, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useDeleteChannelMutation,
  useGetChannelsQuery,
  useUpdateChannelMutation
} from "../../entities/channel/channelApi.js";
import { useGetServerQuery } from "../../entities/server/serverApi.js";
import { setCurrentChannelId } from "../../features/workspace/workspaceSlice.js";
import { openCreateChannel, openEditServer } from "../../features/ui/uiSlice.js";
import { useLogoutMutation } from "../../features/auth/authApi.js";

export function ChannelSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const currentServerId = useSelector((state) => state.workspace.currentServerId);
  const currentChannelId = useSelector((state) => state.workspace.currentChannelId);
  const { data: serverData } = useGetServerQuery(currentServerId, { skip: !currentServerId });
  const { data: channelsData } = useGetChannelsQuery(currentServerId, { skip: !currentServerId });
  const [logout] = useLogoutMutation();
  const [updateChannel] = useUpdateChannelMutation();
  const [deleteChannel] = useDeleteChannelMutation();
  const [editingChannelId, setEditingChannelId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const channels = channelsData?.channels ?? [];
  const currentMember = useMemo(
    () =>
      serverData?.server?.members?.find((member) => member.user._id === currentUser?.id),
    [currentUser?.id, serverData]
  );
  const canManageServer = ["owner", "admin"].includes(currentMember?.role);
  const canManageChannels = ["owner", "admin", "moderator"].includes(currentMember?.role);

  useEffect(() => {
    if (!currentChannelId && channels.length > 0) {
      dispatch(setCurrentChannelId(channels[0]._id));
    }
  }, [channels, currentChannelId, dispatch]);

  async function handleLogout() {
    await logout().unwrap();
    navigate("/login");
  }

  async function handleSaveChannel(channelId) {
    if (!editingName.trim()) {
      return;
    }

    await updateChannel({ channelId, name: editingName }).unwrap();
    setEditingChannelId(null);
    setEditingName("");
  }

  async function handleDeleteChannel(channelId) {
    const confirmed = window.confirm("Delete this channel and all messages?");

    if (!confirmed) {
      return;
    }

    await deleteChannel(channelId).unwrap();

    if (currentChannelId === channelId) {
      dispatch(setCurrentChannelId(null));
    }
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-gray-800 md:flex">
      <header className="flex h-14 items-center justify-between gap-2 border-b border-gray-950 px-4 font-semibold shadow">
        <span className="truncate">{serverData?.server?.name ?? "TribeTalk"}</span>
        <div className="flex shrink-0 items-center gap-1">
          {currentServerId && (
            <button
              title="Copy server ID"
              onClick={() => navigator.clipboard?.writeText(currentServerId)}
              className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              <Copy size={16} />
            </button>
          )}
          {canManageServer && (
            <button
              title="Server settings"
              onClick={() => dispatch(openEditServer())}
              className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              <Settings size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-2 flex items-center justify-between px-2 text-xs font-bold uppercase text-gray-400">
          <span>Text Channels</span>
          {currentServerId && canManageChannels && (
            <button
              title="Create channel"
              onClick={() => dispatch(openCreateChannel())}
              className="rounded p-1 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Plus size={16} />
            </button>
          )}
        </div>

        <div className="space-y-1">
          {channels.map((channel) => (
            <div
              key={channel._id}
              className={`group flex items-center gap-1 rounded ${
                currentChannelId === channel._id
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700/70 hover:text-white"
              }`}
            >
              {editingChannelId === channel._id ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSaveChannel(channel._id);
                  }}
                  className="flex min-w-0 flex-1 items-center gap-1 px-2 py-1"
                >
                  <input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    className="h-8 min-w-0 flex-1 rounded bg-gray-950 px-2 text-sm outline-none"
                    autoFocus
                  />
                  <button className="rounded px-2 py-1 text-xs text-emerald-300 hover:bg-gray-600">
                    Save
                  </button>
                </form>
              ) : (
                <>
                  <button
                    onClick={() => dispatch(setCurrentChannelId(channel._id))}
                    className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-sm font-medium"
                  >
                    <Hash size={17} />
                    <span className="truncate">{channel.name}</span>
                  </button>
                  {canManageChannels && (
                    <div className="flex pr-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        title="Edit channel"
                        onClick={() => {
                          setEditingChannelId(channel._id);
                          setEditingName(channel.name);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-600 hover:text-white"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        title="Delete channel"
                        onClick={() => handleDeleteChannel(channel._id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-600 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex h-14 items-center gap-2 border-t border-gray-950 px-4 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
