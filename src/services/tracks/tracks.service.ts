import { api } from '@/lib/api'
import { Track, CreateTrackParams, UpdateTrackParams, TracksResponse } from './types'

export const tracksService = {
  getTracks: () => {
    return api.get<TracksResponse>('/track')
  },

  getTrack: (id: number) => {
    return api.get<Track>(`/track/${id}`)
  },
 
  createTrack: (data: CreateTrackParams) => {
    return api.post<Track>('/admin/track', data as unknown as Record<string, unknown>)
  },

  updateTrack: (data: UpdateTrackParams) => {
    const { id, ...rest } = data
    return api.put<Track>(`/admin/track/${id}`, rest)
  },

  deleteTrack: (id: number) => {
    return api.delete<void>(`/admin/track/${id}`).then(() => undefined)
  },

  addSessionToTrack: (trackId: number, sessionId: number) => {
    return api.post(`/admin/track/${trackId}/session/${sessionId}`, {})
  }
} 