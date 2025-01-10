import { api } from '@/lib/api'
import { Session, CreateSessionParams } from './types'
import { PaginatedResponse } from '../common/types'

export const sessionsService = {
  getSessions: async (eventId: string, page = 1, limit = 10): Promise<PaginatedResponse<Session>> => {
    const response = await api.get(`/events/${eventId}/sessions?page=${page}&limit=${limit}`)
    return response.json()
  },

  getSession: async (eventId: string, sessionId: string): Promise<Session> => {
    const response = await api.get(`/events/${eventId}/sessions/${sessionId}`)
    return response.json()
  },

  createSession: async (data: CreateSessionParams): Promise<Session> => {
    const response = await api.post(`/events/${data.eventId}/sessions`, data)
    return response.json()
  }
} 