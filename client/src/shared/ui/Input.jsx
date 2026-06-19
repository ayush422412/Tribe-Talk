export function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <input
        className={`h-11 w-full rounded-md border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-accent ${className}`}
        {...props}
      />
    </label>
  );
}
