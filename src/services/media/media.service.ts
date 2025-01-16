import { api } from '@/lib/api'
import { MediaType, MediaUploadResponse,  } from './types'

export const mediaService = {
  uploadMedia: async (file: File, mediaType: MediaType) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mediaType', mediaType)
    
    return api.post<MediaUploadResponse>('/media/upload', formData)
  }
} 