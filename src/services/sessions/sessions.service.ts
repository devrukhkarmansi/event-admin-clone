import { api } from '@/lib/api'
import { Session, CreateSessionParams, UpdateSessionParams, SessionsResponse, SessionFilters } from './types'

export const sessionsService = {
  getSessions: (filters?: SessionFilters) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value))
        }
      })
    }
    return api.get<SessionsResponse>(`/admin/session?${params}`)
  },

  getSession: (id: number) => {
    return api.get<Session>(`/session/${id}`)
  },

  createSession: (data: CreateSessionParams) => {
    return api.post<Session>('/admin/session', data as unknown as Record<string, unknown>)
  },

  updateSession: (data: UpdateSessionParams) => {
    const { id, ...rest } = data
    return api.put<Session>(`/admin/session/${id}`, rest as unknown as Record<string, unknown>)
  },

  deleteSession: (id: number) => {
    return api.delete<void>(`/admin/session/${id}`).then(() => undefined)
  }
} 