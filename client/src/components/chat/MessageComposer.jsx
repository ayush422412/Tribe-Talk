import { Paperclip, Send, X } from "lucide-react";

export function MessageComposer({
  content,
  selectedFile,
  channelName,
  hasActiveChannel,
  isSending,
  canSend,
  onContentChange,
  onFileChange,
  onRemoveFile,
  onSubmit
}) {
  return (
    <form onSubmit={onSubmit} className="shrink-0 border-t-[3px] border-ink bg-[#fffdf5] p-4">
      {selectedFile && (
        <div className="mb-2 flex items-center justify-between rounded-xl border-2 border-ink bg-[#fff3c8] px-3 py-2 text-sm text-ink">
          <span className="truncate">{selectedFile.name}</span>
          <button
            type="button"
            title="Remove file"
            onClick={onRemoveFile}
            className="rounded-lg border-2 border-ink p-1 text-ink hover:bg-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-2xl border-[3px] border-ink bg-white px-3 py-2 shadow-[4px_4px_0_#171717]">
        <label
          title="Attach file"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-ink text-ink hover:bg-[#fff3c8]"
        >
          <Paperclip size={18} />
          <input
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            disabled={!hasActiveChannel}
          />
        </label>
        <input
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder={channelName ? `Message #${channelName}` : "Select a channel to chat"}
          disabled={!hasActiveChannel}
          className="h-10 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-gray-500"
        />
        <button
          title="Send message"
          disabled={!canSend || isSending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-ink bg-[#83df4a] text-ink shadow-[2px_2px_0_#171717] disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
