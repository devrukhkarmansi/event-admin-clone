import { api } from '@/lib/api'
import { CreateSponsorParams, Event, Sponsor, SponsorsResponse, UpdateSponsorParams } from './types'
import { PaginatedResponse } from '../common/types'

export interface UpdateEventParams {
  id: number
  name?: string
  description?: string
  logoId?: number
  address?: {
    line1: string
    line2?: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  floorPlans?: {
    id?: number
    mediaId: number
    label: string
  }[]
}

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

  updateEvent: (data: UpdateEventParams) => {
    const transformedData = {
      name: data.name,
      description: data.description,
      logoId: data.logoId,
      address: data.address,
      floorPlans: data.floorPlans
    }
    return api.put<Event>(`/admin/event/${data.id}`, transformedData as unknown as Record<string, unknown>)
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