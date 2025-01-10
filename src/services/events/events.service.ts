import { api } from '@/lib/api'
import { Event, CreateEventParams } from './types'
import { PaginatedResponse } from '../common/types'

export const eventsService = {
  getEvents: async (page = 1, limit = 10): Promise<PaginatedResponse<Event>> => {
    const response = await api.get(`/events?page=${page}&limit=${limit}`)
    return response.json()
  },

  getEvent: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`)
    return response.json()
  },

  createEvent: async (data: CreateEventParams): Promise<Event> => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, String(value))
        }
      }
    })
    
    const response = await api.post('/events', formData)
    return response.json()
  }
} 