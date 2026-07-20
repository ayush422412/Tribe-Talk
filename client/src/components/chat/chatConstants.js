export const API_ORIGIN = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api").replace(
  /\/api$/,
  ""
);

export const QUICK_REACTIONS = ["\u{1F44D}", "\u2764\uFE0F", "\u{1F602}", "\u{1F525}"];
