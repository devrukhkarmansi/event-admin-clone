import { api } from '@/lib/api'
import { CreateSponsorParams, Event, SponsorsResponse, UpdateSponsorParams } from './types'
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
    const { type, ...rest } = data;
    const requestData = {
      ...rest,
      sponsorType: type,
    }

    const response = await api.post('/admin/sponsor', requestData as unknown as Record<string, unknown>)
    return response.json()
  },

  updateSponsor: async (data: UpdateSponsorParams) => {
    const { type, id, ...rest } = data;
    const requestData = {
      ...rest,
      sponsorType: type,
    }

    const response = await api.put(`/admin/sponsor/${id}`, requestData as unknown as Record<string, unknown>)
    return response.json()
  },

  deleteSponsor: async (id: string | number) => {
    await api.delete(`/admin/sponsor/${id}`)
    return
  },

  uploadSponsorLogo: async (id: string | number, logo: File) => {
    const formData = new FormData()
    formData.append('logo', logo)
    const response = await api.patch(`/sponsors/${id}/logo`, formData)
    return response.json()
  },

  getSponsor: async (id: string | number) => {
    const response = await api.get(`/sponsor/${id}`)
    return response.json()
  },

  getSponsors: async (): Promise<SponsorsResponse> => {
    const response = await api.get('/sponsor')
    return response.json()
  }
} 