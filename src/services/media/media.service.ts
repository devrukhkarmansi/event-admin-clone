import { api } from '@/lib/api'
import { MediaType } from './types'

export const mediaService = {
  uploadMedia: async (file: File, mediaType: MediaType) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mediaType', mediaType)
    
    const response = await api.post('/media/upload', formData)
    return response.json()
  }
} 