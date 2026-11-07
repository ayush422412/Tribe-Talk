import { Hash, Search, X } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetChannelsQuery } from "../../api/channel/channelApi.js";
import { useCreateMessageMutation, useDeleteMessageMutation, useEditMessageMutation, useGetMessagesQuery, useLazyGetMessagesQuery, useLazySearchMessagesQuery, useMarkChannelReadMutation, useToggleReactionMutation, useUploadMessageFileMutation } from "../../api/message/messageApi.js";
import { useGetServerQuery } from "../../api/server/serverApi.js";
import { getSocket } from "../../services/socketClient.js";
import { setCurrentChannelId, setCurrentServerId } from "../../store/slices/workspaceSlice.js";
import { MessageComposer } from "./MessageComposer.jsx";
import { MessageList } from "./MessageList.jsx";

export function ChatArea() {
  const dispatch = useDispatch();
  const currentServerId = useSelector((state) => state.workspace.currentServerId);
  const currentChannelId = useSelector((state) => state.workspace.currentChannelId);
  const currentUser = useSelector((state) => state.auth.user);
  const { data: channelsData } = useGetChannelsQuery(currentServerId, { skip: !currentServerId });
  const { data: serverData } = useGetServerQuery(currentServerId, { skip: !currentServerId });
  const { data: messagesData, refetch } = useGetMessagesQuery(
    { channelId: currentChannelId },
    { skip: !currentChannelId }
  );
  const [loadOlderMessages, loadOlderState] = useLazyGetMessagesQuery();
  const [markChannelRead] = useMarkChannelReadMutation();
  const [createMessage, createMessageState] = useCreateMessageMutation();
  const [uploadMessageFile, uploadState] = useUploadMessageFileMutation();
  const [editMessage] = useEditMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [toggleReaction] = useToggleReactionMutation();
  const [searchMessages, searchState] = useLazySearchMessagesQuery();
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [liveMessages, setLiveMessages] = useState([]);
  const [deletedMessageIds, setDeletedMessageIds] = useState([]);
  const [olderMessages, setOlderMessages] = useState([]);
  const [newerMessages, setNewerMessages] = useState([]);
  const [olderPageInfo, setOlderPageInfo] = useState(null);
  const [newerPageInfo, setNewerPageInfo] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messageScrollRef = useRef(null);
  const scrollPositionByChannelRef = useRef(new Map());
  const restoredChannelRef = useRef(null);
  const markedReadChannelRef = useRef(null);
  const shouldFollowLatestRef = useRef(true);

  const currentChannel = useMemo(
    () => channelsData?.channels?.find((channel) => channel._id === currentChannelId),
    [channelsData, currentChannelId]
  );
  const currentMember = useMemo(
    () => serverData?.server?.members?.find((member) => member.user._id === currentUser?.id),
    [currentUser?.id, serverData]
  );
  const canDeleteAnyMessage = ["owner", "admin", "moderator"].includes(currentMember?.role);
  const messages = mergeMessages(
    [...olderMessages, ...(messagesData?.messages ?? []), ...newerMessages],
    liveMessages,
    deletedMessageIds
  );

  useLayoutEffect(() => {
    const scrollContainer = messageScrollRef.current;

    if (!scrollContainer || !messagesData || !currentChannelId || restoredChannelRef.current === currentChannelId) {
      return;
    }

    const savedPosition = scrollPositionByChannelRef.current.get(currentChannelId);
    scrollContainer.scrollTop = savedPosition ?? scrollContainer.scrollHeight;
    shouldFollowLatestRef.current = savedPosition === undefined;
    restoredChannelRef.current = currentChannelId;
  }, [currentChannelId, messages.length]);

  function saveScrollPosition() {
    if (currentChannelId && messageScrollRef.current) {
      const scrollContainer = messageScrollRef.current;
      scrollPositionByChannelRef.current.set(currentChannelId, scrollContainer.scrollTop);
      shouldFollowLatestRef.current = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 100;
    }
  }

  useLayoutEffect(() => {
    const scrollContainer = messageScrollRef.current;
    if (scrollContainer && shouldFollowLatestRef.current) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages.length]);

  useEffect(() => {
    setLiveMessages([]);
    setDeletedMessageIds([]);
    setOlderMessages([]);
    setNewerMessages([]);
    setOlderPageInfo(null);
    setNewerPageInfo(null);
    setTypingUsers({});
    markedReadChannelRef.current = null;

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

  useEffect(() => {
    if (!currentChannelId || !messagesData || markedReadChannelRef.current === currentChannelId) {
      return;
    }

    // Preserve the unread page on screen before saving the new read position.
    markChannelRead(currentChannelId);
    markedReadChannelRef.current = currentChannelId;
  }, [currentChannelId, markChannelRead, messagesData]);

  async function handleMessageScroll() {
    saveScrollPosition();
    const scrollContainer = messageScrollRef.current;
    const olderInfo = olderPageInfo ?? messagesData?.pageInfo;
    const newerInfo = newerPageInfo ?? messagesData?.pageInfo;

    if (!scrollContainer || loadOlderState.isFetching) {
      return;
    }

    if (scrollContainer.scrollTop <= 80 && olderInfo?.hasOlder) {
      const previousHeight = scrollContainer.scrollHeight;
      const result = await loadOlderMessages({ channelId: currentChannelId, before: olderInfo.nextBefore }).unwrap();
      setOlderMessages((existingMessages) => mergeMessageArrays(result.messages, existingMessages));
      setOlderPageInfo(result.pageInfo);

      requestAnimationFrame(() => {
        const updatedContainer = messageScrollRef.current;
        if (updatedContainer) updatedContainer.scrollTop = updatedContainer.scrollHeight - previousHeight;
      });
      return;
    }

    const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 80;
    if (isNearBottom && newerInfo?.hasNewer) {
      const result = await loadOlderMessages({ channelId: currentChannelId, after: newerInfo.nextAfter }).unwrap();
      setNewerMessages((existingMessages) => mergeMessageArrays(existingMessages, result.messages));
      setNewerPageInfo(result.pageInfo);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedContent = content.trim();
    if ((!trimmedContent && !selectedFile) || !currentChannelId) {
      return;
    }

    shouldFollowLatestRef.current = true;

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

  async function handleSearch(event) {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    setIsSearchOpen(true);
    await searchMessages({ q: query, limit: 20 });
  }

  function closeSearch() {
    setIsSearchOpen(false);
    setSearchTerm("");
  }

  function openSearchResult(message) {
    if (message.serverId && message.serverId !== currentServerId) {
      dispatch(setCurrentServerId(message.serverId));
    }
    dispatch(setCurrentChannelId(message.channel));
    closeSearch();
  }

  if (!currentServerId) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center bg-[#fff9e8] px-6 text-center text-gray-400">
        Create a server to begin.
      </section>
    );
  }

  return (
    <section className="relative flex min-w-0 flex-1 flex-col bg-[#fff9e8]">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b-[3px] border-ink bg-[#fffdf5] px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-[#536dfe] text-white shadow-[2px_2px_0_#171717]"><Hash size={20} /></span>
        <span className="hidden shrink-0 font-black uppercase tracking-wide sm:inline">{currentChannel?.name ?? "Select a channel"}</span>
        <form onSubmit={handleSearch} className="ml-auto flex min-w-0 flex-1 max-w-md items-center gap-2 rounded-xl border-2 border-ink bg-white px-3 py-2 shadow-[2px_2px_0_#171717]">
          <Search size={17} className="shrink-0" aria-hidden="true" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-gray-400"
            placeholder="Search messages"
            aria-label="Search messages"
          />
          {isSearchOpen && <button type="button" onClick={closeSearch} className="rounded p-0.5 hover:bg-gray-100" aria-label="Close search"><X size={16} /></button>}
        </form>
      </header>

      {isSearchOpen && (
        <aside className="absolute inset-x-4 top-20 z-20 max-h-[min(70vh,560px)] overflow-y-auto rounded-2xl border-[3px] border-ink bg-[#fffdf5] p-4 shadow-[5px_5px_0_#171717] sm:inset-x-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-black uppercase tracking-wide">Message search</h2>
            {searchState.data?.pageInfo?.total !== undefined && <span className="text-sm font-bold text-gray-500">{searchState.data.pageInfo.total} result{searchState.data.pageInfo.total === 1 ? "" : "s"}</span>}
          </div>
          {!searchTerm.trim() && <p className="text-sm font-semibold text-gray-500">Type words from a message, then press Enter.</p>}
          {searchState.isFetching && <p className="text-sm font-semibold">Searching messages...</p>}
          {searchState.isError && <p className="rounded-lg border-2 border-red-700 bg-red-50 p-3 text-sm font-semibold text-red-800">{searchState.error?.data?.message ?? "Could not search messages. Please try again."}</p>}
          {!searchState.isFetching && !searchState.isError && searchState.data && searchState.data.messages.length === 0 && <p className="text-sm font-semibold text-gray-500">No messages matched your search.</p>}
          <div className="space-y-2">
            {searchState.data?.messages?.map((message) => (
              <button key={message._id} type="button" onClick={() => openSearchResult(message)} className="block w-full rounded-xl border-2 border-ink bg-white p-3 text-left hover:bg-[#fff3c8]">
                <div className="flex items-center justify-between gap-3 text-xs font-bold text-gray-500"><span>{message.author?.username ?? "Unknown user"}</span><time>{new Date(message.createdAt).toLocaleString()}</time></div>
                <p className="mt-1 line-clamp-2 font-semibold text-ink">{message.content || "Attachment"}</p>
              </button>
            ))}
          </div>
        </aside>
      )}

      <div
        ref={messageScrollRef}
        onScroll={handleMessageScroll}
        className="flex-1 overflow-y-auto px-6 py-7"
      >
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
          firstUnreadMessageId={messagesData?.pageInfo?.firstUnreadMessageId}
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

function mergeMessageArrays(firstMessages, secondMessages) {
  return [...firstMessages, ...secondMessages].filter(
    (message, index, allMessages) => allMessages.findIndex((item) => item._id === message._id) === index
  );
}
