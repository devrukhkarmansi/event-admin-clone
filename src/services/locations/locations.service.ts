import { api } from '@/lib/api'
import { Location, CreateLocationParams, UpdateLocationParams, LocationsResponse } from './types'

export const locationsService = {
  getLocations: () => {
    return api.get<LocationsResponse>('/location')
  },

  getLocation: (id: number) => {
    return api.get<Location>(`/location/${id}`)
  },

  createLocation: (data: CreateLocationParams) => {
    return api.post<Location>('/admin/location', data as unknown as Record<string, unknown>)
  },

  updateLocation: (data: UpdateLocationParams) => {
    const { id, ...rest } = data
    return api.put<Location>(`/admin/location/${id}`, rest as unknown as Record<string, unknown>)
  },

  deleteLocation: (id: number) => {
    return api.delete<void>(`/admin/location/${id}`).then(() => undefined)
  }
} 