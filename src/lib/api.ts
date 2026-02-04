import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "@/lib/auth"

const BASE_URL = import.meta.env.VITE_API_URL as string

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error("No refresh token")

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    clearTokens()
    throw new Error("Refresh failed")
  }

  const data = await res.json()
  // backend returns: { accessToken, refreshToken }
  saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
  return data.accessToken as string
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`
  const headers = new Headers(options.headers || {})
  headers.set("Content-Type", "application/json")

  const access = getAccessToken()
  if (access) headers.set("Authorization", `Bearer ${access}`)

  // 1st try
  let res = await fetch(url, { ...options, headers })

  // if token expired -> refresh -> retry once
  if (res.status === 401) {
    try {
      const newAccess = await refreshAccessToken()
      headers.set("Authorization", `Bearer ${newAccess}`)
      res = await fetch(url, { ...options, headers })
    } catch {
      // if refresh fails -> logout
      clearTokens()
      throw new Error("Unauthorized")
    }
  }

  return res
}
