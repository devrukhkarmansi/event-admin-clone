import { api } from '@/lib/api'
import { CreateSponsorParams, Event, UpdateSponsorParams } from './types'
import { PaginatedResponse } from '../common/types'

export const eventsService = {
  getEvents: async ( page = 1, limit = 10): Promise<PaginatedResponse<Event>> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    })
    
    const response = await api.get(`/events?${params}`)
    return response.json()
  },

  getEvent: async (): Promise<Event> => {
    const response = await api.get('/event')
    return response.json()
  },

  createSponsor: async (data: CreateSponsorParams) => {
    const response = await api.post('/sponsors', data as unknown as Record<string, unknown>)
    return response.json()
  },

  updateSponsor: async (data: UpdateSponsorParams) => {
    const response = await api.patch(`/sponsors/${data.id}`, data as unknown as Record<string, unknown>)
    return response.json()
  },

  deleteSponsor: async (id: string | number) => {
    const response = await api.delete(`/sponsors/${id}`)
    return response.json()
  },

  uploadSponsorLogo: async (id: string | number, logo: File) => {
    const formData = new FormData()
    formData.append('logo', logo)
    const response = await api.patch(`/sponsors/${id}/logo`, formData)
    return response.json()
  }
} 