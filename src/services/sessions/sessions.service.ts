import { api } from '@/lib/api'
import { CreateSessionParams, Session } from './types'
import { PaginatedResponse } from '../common/types'

export const sessionsService = {
  getSessions: (eventId: string, page = 1, limit = 10) => {
    return api.get<PaginatedResponse<Session>>(`/events/${eventId}/sessions?page=${page}&limit=${limit}`)
  },

  getSession: (eventId: string, sessionId: string) => {
    return api.get<Session>(`/events/${eventId}/sessions/${sessionId}`)
  },

  createSession: (data: CreateSessionParams) => {
    return api.post<Session>(`/events/${data.eventId}/sessions`, data)
  }
} 