import { Hash } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useGetChannelsQuery } from "../../api/channel/channelApi.js";
import { useCreateMessageMutation, useDeleteMessageMutation, useEditMessageMutation, useGetMessagesQuery, useToggleReactionMutation, useUploadMessageFileMutation } from "../../api/message/messageApi.js";
import { useGetServerQuery } from "../../api/server/serverApi.js";
import { getSocket } from "../../services/socketClient.js";
import { MessageComposer } from "./MessageComposer.jsx";
import { MessageList } from "./MessageList.jsx";

export function ChatArea() {
  const currentServerId = useSelector((state) => state.workspace.currentServerId);
  const currentChannelId = useSelector((state) => state.workspace.currentChannelId);
  const currentUser = useSelector((state) => state.auth.user);
  const { data: channelsData } = useGetChannelsQuery(currentServerId, { skip: !currentServerId });
  const { data: serverData } = useGetServerQuery(currentServerId, { skip: !currentServerId });
  const { data: messagesData, refetch } = useGetMessagesQuery(
    { channelId: currentChannelId },
    { skip: !currentChannelId }
  );
  const [createMessage, createMessageState] = useCreateMessageMutation();
  const [uploadMessageFile, uploadState] = useUploadMessageFileMutation();
  const [editMessage] = useEditMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [toggleReaction] = useToggleReactionMutation();
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [liveMessages, setLiveMessages] = useState([]);
  const [deletedMessageIds, setDeletedMessageIds] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef(null);

  const currentChannel = useMemo(
    () => channelsData?.channels?.find((channel) => channel._id === currentChannelId),
    [channelsData, currentChannelId]
  );
  const currentMember = useMemo(
    () => serverData?.server?.members?.find((member) => member.user._id === currentUser?.id),
    [currentUser?.id, serverData]
  );
  const canDeleteAnyMessage = ["owner", "admin", "moderator"].includes(currentMember?.role);
  const messages = mergeMessages(messagesData?.messages ?? [], liveMessages, deletedMessageIds);

  useEffect(() => {
    setLiveMessages([]);
    setDeletedMessageIds([]);
    setTypingUsers({});

    if (!currentChannelId) {
      return;
    }

    const socket = getSocket();
    socket.connect();
    socket.emit("channel:join", { channelId: currentChannelId });

    function handleCreated({ message }) {
      setLiveMessages((previousMessages) => addMessageOnce(previousMessages, message));
    }

    function handleUpdated({ message }) {
      setLiveMessages((previousMessages) => upsertMessage(previousMessages, message));
    }

    function handleDeleted({ messageId }) {
      removeMessage(messageId);
    }

    function handleTypingStarted({ channelId, user }) {
      if (channelId !== currentChannelId || user.id === currentUser?.id) {
        return;
      }

      setTypingUsers((users) => ({ ...users, [user.id]: user.username }));
    }

    function handleTypingStopped({ channelId, userId }) {
      if (channelId !== currentChannelId) {
        return;
      }

      setTypingUsers((users) => {
        const { [userId]: removedUser, ...remainingUsers } = users;
        return remainingUsers;
      });
    }

    socket.on("message:created", handleCreated);
    socket.on("message:updated", handleUpdated);
    socket.on("message:deleted", handleDeleted);
    socket.on("typing:started", handleTypingStarted);
    socket.on("typing:stopped", handleTypingStopped);

    return () => {
      socket.emit("channel:leave", { channelId: currentChannelId });
      socket.off("message:created", handleCreated);
      socket.off("message:updated", handleUpdated);
      socket.off("message:deleted", handleDeleted);
      socket.off("typing:started", handleTypingStarted);
      socket.off("typing:stopped", handleTypingStopped);
    };
  }, [currentChannelId, currentUser?.id]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedContent = content.trim();
    if ((!trimmedContent && !selectedFile) || !currentChannelId) {
      return;
    }

    if (selectedFile) {
      await uploadMessageFile({
        channelId: currentChannelId,
        content: trimmedContent,
        file: selectedFile
      }).unwrap();
      setContent("");
      setSelectedFile(null);
      refetch();
      return;
    }

    await sendTextMessage(trimmedContent);
    stopTyping();
    setContent("");
  }

  function handleContentChange(value) {
    setContent(value);

    if (!currentChannelId) {
      return;
    }

    const socket = getSocket();
    if (!socket.connected) {
      return;
    }

    if (!value.trim()) {
      stopTyping();
      return;
    }

    socket.emit("typing:start", { channelId: currentChannelId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 1500);
  }

  function stopTyping() {
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = null;

    if (currentChannelId) {
      getSocket().emit("typing:stop", { channelId: currentChannelId });
    }
  }

  async function sendTextMessage(messageContent) {
    const socket = getSocket();

    if (socket.connected) {
      socket.emit("message:create", { channelId: currentChannelId, content: messageContent }, (response) => {
        if (!response?.ok) {
          createMessage({ channelId: currentChannelId, content: messageContent }).then(refetch);
        }
      });
      return;
    }

    await createMessage({ channelId: currentChannelId, content: messageContent }).unwrap();
    refetch();
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
    if (!window.confirm("Delete this message?")) {
      return;
    }

    await deleteMessage(messageId).unwrap();
    removeMessage(messageId);
    refetch();
  }

  function removeMessage(messageId) {
    setLiveMessages((messages) => messages.filter((message) => message._id !== messageId));
    setDeletedMessageIds((messageIds) =>
      messageIds.includes(messageId) ? messageIds : [...messageIds, messageId]
    );
  }

  async function handleReaction(messageId, emoji) {
    await toggleReaction({ messageId, emoji }).unwrap();
    refetch();
  }

  function handleStartEditing(message) {
    setEditingMessageId(message._id);
    setEditingContent(message.content);
  }

  function handleCancelEditing() {
    setEditingMessageId(null);
    setEditingContent("");
  }

  if (!currentServerId) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center bg-[#fff9e8] px-6 text-center text-gray-400">
        Create a server to begin.
      </section>
    );
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-[#fff9e8]">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b-[3px] border-ink bg-[#fffdf5] px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-[#536dfe] text-white shadow-[2px_2px_0_#171717]"><Hash size={20} /></span>
        <span className="font-black uppercase tracking-wide">{currentChannel?.name ?? "Select a channel"}</span>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-7">
        <MessageList
          messages={messages}
          currentUserId={currentUser?.id}
          canDeleteAnyMessage={canDeleteAnyMessage}
          editingMessageId={editingMessageId}
          editingContent={editingContent}
          onEditingContentChange={setEditingContent}
          onStartEditing={handleStartEditing}
          onCancelEditing={handleCancelEditing}
          onSaveEditing={handleSaveMessage}
          onDelete={handleDeleteMessage}
          onReact={handleReaction}
        />
      </div>

      {Object.keys(typingUsers).length > 0 && (
        <div className="mx-5 mb-1 rounded-full border-2 border-ink bg-[#fff3c8] px-3 py-1 text-sm font-bold text-ink">
          {formatTypingUsers(Object.values(typingUsers))} typing...
        </div>
      )}

      <MessageComposer
        content={content}
        selectedFile={selectedFile}
        channelName={currentChannel?.name}
        hasActiveChannel={Boolean(currentChannelId)}
        isSending={createMessageState.isLoading || uploadState.isLoading}
        canSend={Boolean(currentChannelId && (content.trim() || selectedFile))}
        onContentChange={handleContentChange}
        onFileChange={setSelectedFile}
        onRemoveFile={() => setSelectedFile(null)}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

function formatTypingUsers(usernames) {
  if (usernames.length === 1) {
    return usernames[0];
  }

  if (usernames.length === 2) {
    return `${usernames[0]} and ${usernames[1]}`;
  }

  return `${usernames[0]} and ${usernames.length - 1} others`;
}

function addMessageOnce(messages, message) {
  return messages.some((existingMessage) => existingMessage._id === message._id)
    ? messages
    : [...messages, message];
}

function upsertMessage(messages, message) {
  const exists = messages.some((existingMessage) => existingMessage._id === message._id);

  return exists
    ? messages.map((existingMessage) => existingMessage._id === message._id ? message : existingMessage)
    : [...messages, message];
}

function mergeMessages(savedMessages, liveMessages, deletedMessageIds) {
  return [...savedMessages, ...liveMessages].reduce(
    (messages, message) => upsertMessage(messages, message),
    []
  ).filter((message) => !deletedMessageIds.includes(message._id));
}
