import { config } from "@/config"

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

interface ApiError {
  message: string;
  statusCode: number;
}

export class TokenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TokenError'
  }
}

export function clearAuthTokens() {
  document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax"
  document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax"
}

export function isAuthenticated(): boolean {
  return !!getCookie('accessToken')
}

export function setAuthTokens(tokens: TokenResponse) {
  const accessExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()
  const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()

  document.cookie = `accessToken=${tokens.access_token}; path=/; expires=${accessExpiry}; SameSite=Lax`
  document.cookie = `refreshToken=${tokens.refresh_token}; path=/; expires=${refreshExpiry}; SameSite=Lax; secure`
}

export async function refreshAccessToken(): Promise<TokenResponse> {
  const refreshToken = getCookie('refreshToken')
  
  if (!refreshToken) {
    throw new TokenError('No refresh token found')
  }

  try {
    const response = await fetch(`${config.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })

    const data = await response.json()

    if (!response.ok) {
      const error = data as ApiError
      throw new TokenError(error.message || 'Failed to refresh token')
    }

    setAuthTokens(data)
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw new TokenError(error.message)
    }
    throw new TokenError('Failed to refresh token')
  }
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null
  return null
} 