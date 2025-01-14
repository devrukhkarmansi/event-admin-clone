import { useAuthStore } from '@/store/auth-store'
import { config } from "@/config"

interface RequestOptions extends RequestInit {
  data?: Record<string, unknown> | FormData;
}

async function fetchWithAuth(url: string, options: RequestOptions = {}) {
  const accessToken = useAuthStore.getState().getAccessToken()
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    ...options.headers as Record<string, string>,
  }

  if (!(options.data instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  
  let response = await fetch(url, {
    ...options,
    headers,
    body: options.data instanceof FormData ? options.data : JSON.stringify(options.data),
  })

  // Handle response status
  if (!response.ok) {
    const error = await response.json()
    
    // Handle 403 immediately without refresh attempt
    if (response.status === 403 || error.statusCode === 403) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      throw new Error('Insufficient permissions')
    }

    if (response.status === 401) {
      try {
        const refreshToken = useAuthStore.getState().getRefreshToken()
        const refreshResponse = await fetch(`${config.apiUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        })

        if (!refreshResponse.ok) {
          useAuthStore.getState().clearAuth()
          throw new Error('Authentication failed')
        }

        const tokens = await refreshResponse.json()
        useAuthStore.getState().setTokens(tokens)

        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        })

        // Check status of retried request
        if (!response.ok) {
          const retryError = await response.json()
          if (response.status === 403) {
            useAuthStore.getState().clearAuth()
            window.location.href = '/login'
            throw new Error('Insufficient permissions')
          }
          throw retryError
        }
        return response
      } catch {
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        throw new Error('Authentication failed')
      }
    }

    throw error
  }

  return response
}

export const api = {
  get: (endpoint: string) => {
    return fetchWithAuth(`${config.apiUrl}${endpoint}`)
  },
  
  post: (endpoint: string, data: Record<string, unknown> | FormData) => {
    return fetchWithAuth(`${config.apiUrl}${endpoint}`, {
      method: 'POST',
      data,
    })
  },

  put: (endpoint: string, data: Record<string, unknown> | FormData) => {
    return fetchWithAuth(`${config.apiUrl}${endpoint}`, {
      method: 'PUT',
      data,
    })
  },

  patch: (endpoint: string, data: Record<string, unknown> | FormData) => 
    fetchWithAuth(`${config.apiUrl}${endpoint}`, {
      method: 'PATCH',
      data,
    }),

  delete: (endpoint: string) => 
    fetchWithAuth(`${config.apiUrl}${endpoint}`, {
      method: 'DELETE',
    }),
} 