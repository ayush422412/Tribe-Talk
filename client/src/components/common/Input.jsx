export function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[.12em] text-ink">
        {label}
      </span>
      <input
        className={`h-12 w-full rounded-xl border-[2px] border-ink bg-white px-4 text-sm text-ink outline-none transition placeholder:text-gray-500 focus:shadow-[3px_3px_0_#536dfe] ${className}`}
        {...props}
      />
    </label>
  );
}
