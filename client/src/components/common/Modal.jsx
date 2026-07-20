import { X } from "lucide-react";

export function Modal({ title, isOpen, onClose, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-[24px] border-[3px] border-ink bg-[#fffdf5] p-6 shadow-[7px_7px_0_#171717]">
        <header className="mb-5 flex items-center justify-between border-b-[2px] border-ink pb-4">
          <h2 className="text-lg font-black text-ink">{title}</h2>
          <button
            title="Close"
            onClick={onClose}
            className="rounded-lg border-2 border-ink p-1 text-ink hover:bg-[#fff3c8]"
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
