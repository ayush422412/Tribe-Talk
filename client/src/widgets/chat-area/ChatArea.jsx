import { FileText, Hash, Paperclip, Pencil, Send, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useGetChannelsQuery } from "../../entities/channel/channelApi.js";
import { useGetServerQuery } from "../../entities/server/serverApi.js";
import {
  useCreateMessageMutation,
  useDeleteMessageMutation,
  useEditMessageMutation,
  useGetMessagesQuery,
  useToggleReactionMutation,
  useUploadMessageFileMutation
} from "../../entities/message/messageApi.js";
import { getSocket } from "../../shared/socket/socketClient.js";

const apiOrigin = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api").replace(/\/api$/, "");
const quickReactions = ["\u{1F44D}", "\u2764\uFE0F", "\u{1F602}", "\u{1F525}"];

export function ChatArea() {
  const currentServerId = useSelector((state) => state.workspace.currentServerId);
  const currentChannelId = useSelector((state) => state.workspace.currentChannelId);
  const currentUser = useSelector((state) => state.auth.user);
  const { data: channelsData } = useGetChannelsQuery(currentServerId, { skip: !currentServerId });
  const { data: serverData } = useGetServerQuery(currentServerId, { skip: !currentServerId });
  const { data, refetch } = useGetMessagesQuery(
    { channelId: currentChannelId },
    { skip: !currentChannelId }
  );
  const [createMessage, { isLoading }] = useCreateMessageMutation();
  const [uploadMessageFile, uploadState] = useUploadMessageFileMutation();
  const [editMessage] = useEditMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [toggleReaction] = useToggleReactionMutation();
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [liveMessages, setLiveMessages] = useState([]);

  const currentChannel = useMemo(
    () => channelsData?.channels?.find((channel) => channel._id === currentChannelId),
    [channelsData, currentChannelId]
  );
  const currentMember = useMemo(
    () => serverData?.server?.members?.find((member) => member.user._id === currentUser?.id),
    [currentUser?.id, serverData]
  );
  const canDeleteAnyMessage = ["owner", "admin", "moderator"].includes(currentMember?.role);

  useEffect(() => {
    setLiveMessages([]);

    if (!currentChannelId) {
      return;
    }

    const socket = getSocket();
    socket.connect();
    socket.emit("channel:join", { channelId: currentChannelId });

    function handleCreated({ message }) {
      setLiveMessages((messages) => {
        if (messages.some((item) => item._id === message._id)) {
          return messages;
        }

        return [...messages, message];
      });
    }

    socket.on("message:created", handleCreated);

    return () => {
      socket.emit("channel:leave", { channelId: currentChannelId });
      socket.off("message:created", handleCreated);
    };
  }, [currentChannelId]);

  const restMessages = data?.messages ?? [];
  const messages = [...restMessages, ...liveMessages].filter(
    (message, index, all) => all.findIndex((item) => item._id === message._id) === index
  );

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmed = content.trim();
    if ((!trimmed && !selectedFile) || !currentChannelId) {
      return;
    }

    if (selectedFile) {
      await uploadMessageFile({
        channelId: currentChannelId,
        content: trimmed,
        file: selectedFile
      }).unwrap();
      setContent("");
      setSelectedFile(null);
      refetch();
      return;
    }

    const socket = getSocket();

    if (socket.connected) {
      socket.emit("message:create", { channelId: currentChannelId, content: trimmed }, (response) => {
        if (!response?.ok) {
          createMessage({ channelId: currentChannelId, content: trimmed }).then(() => refetch());
        }
      });
    } else {
      await createMessage({ channelId: currentChannelId, content: trimmed }).unwrap();
      refetch();
    }

    setContent("");
  }

  async function handleSaveMessage(messageId) {
    if (!editingContent.trim()) {
      return;
    }

    await editMessage({ messageId, content: editingContent }).unwrap();
    setEditingMessageId(null);
    setEditingContent("");
    refetch();
  }

  async function handleDeleteMessage(messageId) {
    const confirmed = window.confirm("Delete this message?");

    if (!confirmed) {
      return;
    }

    await deleteMessage(messageId).unwrap();
    setLiveMessages((items) => items.filter((item) => item._id !== messageId));
    refetch();
  }

  async function handleReaction(messageId, emoji) {
    await toggleReaction({ messageId, emoji }).unwrap();
    refetch();
  }

  if (!currentServerId) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center bg-gray-900 px-6 text-center text-gray-400">
        Create a server to begin.
      </section>
    );
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-gray-900">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-950 px-4 shadow">
        <Hash size={20} className="text-gray-400" />
        <span className="font-semibold">{currentChannel?.name ?? "Select a channel"}</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No messages yet.
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((message) => (
              <article key={message._id} className="group flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold">
                  {message.author?.username?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold text-gray-100">{message.author?.username}</span>
                    <time className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </time>
                    {message.editedAt && <span className="text-xs text-gray-500">(edited)</span>}
                  </div>
                  {editingMessageId === message._id ? (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleSaveMessage(message._id);
                      }}
                      className="mt-2 flex gap-2"
                    >
                      <input
                        value={editingContent}
                        onChange={(event) => setEditingContent(event.target.value)}
                        className="h-10 min-w-0 flex-1 rounded bg-gray-800 px-3 text-sm outline-none"
                        autoFocus
                      />
                      <button className="rounded bg-accent px-3 text-sm font-semibold">Save</button>
                      <button
                        type="button"
                        onClick={() => setEditingMessageId(null)}
                        className="rounded bg-gray-700 px-3 text-sm"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      {message.content && (
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-200">
                          {message.content}
                        </p>
                      )}
                      {message.attachments?.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <a
                              key={attachment.url}
                              href={`${apiOrigin}${attachment.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex max-w-full items-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
                            >
                              <FileText size={16} />
                              <span className="truncate">{attachment.originalName}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {message.reactions?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.reactions.map((reaction) => (
                        <button
                          key={reaction.emoji}
                          onClick={() => handleReaction(message._id, reaction.emoji)}
                          className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-200 hover:bg-gray-700"
                        >
                          {reaction.emoji} {reaction.users.length}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                  <div className="flex rounded-md bg-gray-800 p-1 shadow">
                    {quickReactions.map((emoji) => (
                      <button
                        key={emoji}
                        title={`React ${emoji}`}
                        onClick={() => handleReaction(message._id, emoji)}
                        className="rounded px-1.5 py-1 text-sm hover:bg-gray-700"
                      >
                        {emoji}
                      </button>
                    ))}
                    {message.author?._id === currentUser?.id && (
                      <button
                        title="Edit message"
                        onClick={() => {
                          setEditingMessageId(message._id);
                          setEditingContent(message.content);
                        }}
                        className="rounded px-1.5 py-1 text-gray-300 hover:bg-gray-700"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {(message.author?._id === currentUser?.id || canDeleteAnyMessage) && (
                      <button
                        title="Delete message"
                        onClick={() => handleDeleteMessage(message._id)}
                        className="rounded px-1.5 py-1 text-gray-300 hover:bg-gray-700 hover:text-red-300"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 p-4">
        {selectedFile && (
          <div className="mb-2 flex items-center justify-between rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-200">
            <span className="truncate">{selectedFile.name}</span>
            <button
              type="button"
              title="Remove file"
              onClick={() => setSelectedFile(null)}
              className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2">
          <label
            title="Attach file"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Paperclip size={18} />
            <input
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              disabled={!currentChannelId}
            />
          </label>
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={
              currentChannel ? `Message #${currentChannel.name}` : "Select a channel to chat"
            }
            disabled={!currentChannelId}
            className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
          <button
            title="Send message"
            disabled={(!content.trim() && !selectedFile) || isLoading || uploadState.isLoading || !currentChannelId}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-white disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </section>
  );
}
