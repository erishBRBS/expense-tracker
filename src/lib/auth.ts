type Tokens = {
  accessToken: string
  refreshToken: string
}

const ACCESS_KEY = "expense_access_token"
const REFRESH_KEY = "expense_refresh_token"

export function saveTokens(tokens: Tokens) {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export function isLoggedIn() {
  return !!getAccessToken()
}
