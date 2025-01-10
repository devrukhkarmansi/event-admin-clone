import { refreshAccessToken, getCookie, TokenError } from "./auth"
import { config } from "@/config"

interface RequestOptions extends RequestInit {
  data?: Record<string, unknown>
}

async function fetchWithAuth(url: string, options: RequestOptions = {}) {
  const accessToken = getCookie('accessToken')
  
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  // If unauthorized, try refresh token
  if (response.status === 401) {
    try {
      const newTokens = await refreshAccessToken()
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newTokens.access_token}`,
          'Content-Type': 'application/json',
        },
      })
    } catch {
      throw new TokenError('Authentication failed')
    }
  }

  return response
}

export const api = {
  get: (endpoint: string) => 
    fetchWithAuth(`${config.apiUrl}${endpoint}`),
  
  post: (endpoint: string, data: Record<string, unknown>) => 
    fetchWithAuth(`${config.apiUrl}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
} 