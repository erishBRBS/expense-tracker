export const API_BASE = import.meta.env.VITE_API_URL as string;
export const SERVER_BASE = import.meta.env.VITE_SERVER_URL as string;

export function normalizeImageUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${SERVER_BASE.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}
