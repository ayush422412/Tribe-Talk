export function Button({ className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "border-[2px] border-ink bg-[#83df4a] text-ink shadow-[3px_3px_0_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
    secondary: "border-[2px] border-ink bg-[#fffdf5] text-ink hover:bg-[#fff3c8]",
    ghost: "border-[2px] border-transparent bg-transparent text-ink hover:border-ink hover:bg-[#fff3c8]"
  };

  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
