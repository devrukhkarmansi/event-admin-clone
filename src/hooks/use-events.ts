import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '@/services'
import { CreateSponsorParams, UpdateSponsorParams } from '@/services/events/types'


export function useEvent() {
  return useQuery({
    queryKey: ['event'],
    queryFn: () => eventsService.getEvent(),
  })
}

export function useCreateSponsor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateSponsorParams) => eventsService.createSponsor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event'] })
    },
  })
}

export function useUpdateSponsor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateSponsorParams) => eventsService.updateSponsor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event'] })
    },
  })
}

export function useDeleteSponsor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => eventsService.deleteSponsor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event'] })
    },
  })
}

export function useUploadSponsorLogo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, logo }: { id: string; logo: File }) => 
      eventsService.uploadSponsorLogo(id, logo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event'] })
    },
  })
} 