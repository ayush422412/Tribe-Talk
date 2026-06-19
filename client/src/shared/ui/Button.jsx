export function Button({ className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-accent text-white hover:bg-[#4752c4]",
    secondary: "bg-gray-700 text-gray-100 hover:bg-gray-600",
    ghost: "bg-transparent text-gray-300 hover:bg-gray-700"
  };

  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
