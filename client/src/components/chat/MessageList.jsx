import { FileText, Pencil, Trash2 } from "lucide-react";
import { API_ORIGIN, QUICK_REACTIONS } from "./chatConstants.js";

export function MessageList({
  messages,
  currentUserId,
  canDeleteAnyMessage,
  editingMessageId,
  editingContent,
  onEditingContentChange,
  onStartEditing,
  onCancelEditing,
  onSaveEditing,
  onDelete,
  onReact
}) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-ink bg-[#fffdf5] text-sm font-bold text-gray-500">
        No messages yet — start the conversation.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {messages.map((message) => {
        const isEditing = editingMessageId === message._id;
        const isAuthor = message.author?._id === currentUserId;
        const canDelete = isAuthor || canDeleteAnyMessage;

        return (
          <article key={message._id} className="group flex gap-3 rounded-2xl px-3 py-2 transition hover:bg-[#fff3c8]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-[#83df4a] text-sm font-black shadow-[2px_2px_0_#171717]">
              {message.author?.username?.[0]?.toUpperCase() ?? "U"}
            </div>

            <div className="min-w-0 flex-1">
              <MessageHeader message={message} />
              {isEditing ? (
                <MessageEditForm
                  value={editingContent}
                  onChange={onEditingContentChange}
                  onSave={() => onSaveEditing(message._id)}
                  onCancel={onCancelEditing}
                />
              ) : (
                <MessageContent message={message} />
              )}
              <ReactionList message={message} onReact={onReact} />
            </div>

            <MessageActions
              isAuthor={isAuthor}
              canDelete={canDelete}
              onStartEditing={() => onStartEditing(message)}
              onDelete={() => onDelete(message._id)}
              onReact={(emoji) => onReact(message._id, emoji)}
            />
          </article>
        );
      })}
    </div>
  );
}

function MessageHeader({ message }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="font-black text-ink">{message.author?.username}</span>
      <time className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</time>
      {message.editedAt && <span className="text-xs text-gray-500">(edited)</span>}
    </div>
  );
}

function MessageEditForm({ value, onChange, onSave, onCancel }) {
  function handleSubmit(event) {
    event.preventDefault();
    onSave();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 min-w-0 flex-1 rounded-xl border-2 border-ink bg-white px-3 text-sm outline-none"
        autoFocus
      />
      <button className="rounded-xl border-2 border-ink bg-[#83df4a] px-3 text-sm font-black">Save</button>
      <button type="button" onClick={onCancel} className="rounded-xl border-2 border-ink bg-white px-3 text-sm font-bold">
        Cancel
      </button>
    </form>
  );
}

function MessageContent({ message }) {
  return (
    <>
      {message.content && (
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-ink">
          {message.content}
        </p>
      )}
      {message.attachments?.length > 0 && (
        <div className="mt-2 space-y-2">
          {message.attachments.map((attachment) => (
            <a
              key={attachment.url}
              href={`${API_ORIGIN}${attachment.url}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex max-w-full items-center gap-2 rounded-xl border-2 border-ink bg-white px-3 py-2 text-sm text-ink hover:bg-[#fff3c8]"
            >
              <FileText size={16} />
              <span className="truncate">{attachment.originalName}</span>
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function ReactionList({ message, onReact }) {
  if (!message.reactions?.length) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {message.reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => onReact(message._id, reaction.emoji)}
          className="rounded-full border-2 border-ink bg-white px-2 py-1 text-xs font-bold text-ink hover:bg-[#fff3c8]"
        >
          {reaction.emoji} {reaction.users.length}
        </button>
      ))}
    </div>
  );
}

function MessageActions({ isAuthor, canDelete, onStartEditing, onDelete, onReact }) {
  return (
    <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
      <div className="flex rounded-md bg-gray-800 p-1 shadow">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            title={`React ${emoji}`}
            onClick={() => onReact(emoji)}
            className="rounded px-1.5 py-1 text-sm hover:bg-gray-700"
          >
            {emoji}
          </button>
        ))}
        {isAuthor && (
          <button
            title="Edit message"
            onClick={onStartEditing}
            className="rounded px-1.5 py-1 text-gray-300 hover:bg-gray-700"
          >
            <Pencil size={15} />
          </button>
        )}
        {canDelete && (
          <button
            title="Delete message"
            onClick={onDelete}
            className="rounded px-1.5 py-1 text-gray-300 hover:bg-gray-700 hover:text-red-300"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
