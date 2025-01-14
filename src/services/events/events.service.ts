import { api } from '@/lib/api'
import { CreateSponsorParams, Event, Sponsor, SponsorsResponse, UpdateSponsorParams } from './types'
import { PaginatedResponse } from '../common/types'

export const eventsService = {
  getEvents: (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    })
    return api.get<PaginatedResponse<Event>>(`/events?${params}`)
  },

  getEvent: () => {
    return api.get<Event>('/event')
  },

  createSponsor: (data: CreateSponsorParams) => {
    const { type, ...rest } = data
    const requestData = { ...rest, sponsorType: type }
    return api.post<Sponsor>('/admin/sponsor', requestData)
  },

  updateSponsor: (data: UpdateSponsorParams) => {
    const { type, id, ...rest } = data
    const requestData = { ...rest, sponsorType: type }
    return api.put<Sponsor>(`/admin/sponsor/${id}`, requestData)
  },

  deleteSponsor: (id: string | number) => {
    return api.delete(`/admin/sponsor/${id}`)
  },

  uploadSponsorLogo: (id: string | number, logo: File) => {
    const formData = new FormData()
    formData.append('logo', logo)
    return api.patch<Sponsor>(`/sponsors/${id}/logo`, formData)
  },

  getSponsor: (id: string | number) => {
    return api.get<Sponsor>(`/sponsor/${id}`)
  },

  getSponsors: () => {
    return api.get<SponsorsResponse>('/sponsor')
  }
} 