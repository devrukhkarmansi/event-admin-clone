import { useMutation } from '@tanstack/react-query'
import { mediaService } from '@/services/media/media.service'
import { MediaType } from '@/services/media/types'

export function useUploadMedia() {
  return useMutation({
    mutationFn: ({ file, mediaType }: { file: File; mediaType: MediaType }) => 
      mediaService.uploadMedia(file, mediaType)
  })
} 