import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tracksService } from '@/services/tracks/tracks.service'
import { CreateTrackParams, UpdateTrackParams } from '@/services/tracks/types'

export const useTracks = () => {
  return useQuery({
    queryKey: ['tracks'],
    queryFn: () => tracksService.getTracks()
  })
}

export const useTrack = (id: number) => {
  return useQuery({
    queryKey: ['track', id],
    queryFn: () => tracksService.getTrack(id)
  })
}

export const useCreateTrack = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTrackParams) => tracksService.createTrack(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
    }
  })
}

export const useUpdateTrack = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTrackParams) => tracksService.updateTrack(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
    }
  })
}

export const useDeleteTrack = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tracksService.deleteTrack(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
    }
  })
} 