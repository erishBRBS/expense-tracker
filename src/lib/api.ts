import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "@/lib/auth";

const BASE_URL = import.meta.env.VITE_API_URL as string;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error("Refresh failed");
  }

  const data: { accessToken: string; refreshToken: string } = await res.json();
  saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.accessToken;
}

type ApiFetchOptions = RequestInit & {
  isFormData?: boolean;
};

export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}) {
  const url = `${BASE_URL}${path}`;

  const headers = new Headers(options.headers || {});

  const access = getAccessToken();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  const isFormData = options.isFormData === true || options.body instanceof FormData;

  // ✅ Only set JSON content-type when NOT uploading FormData
  if (!isFormData && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    try {
      const newAccess = await refreshAccessToken();
      headers.set("Authorization", `Bearer ${newAccess}`);
      res = await fetch(url, { ...options, headers });
    } catch {
      clearTokens();
      throw new Error("Unauthorized");
    }
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    const errBody = isJson ? await res.json().catch(() => ({})) : {};
    const msg = (errBody as any)?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return (isJson ? res.json() : (res.text() as any)) as Promise<T>;
}
