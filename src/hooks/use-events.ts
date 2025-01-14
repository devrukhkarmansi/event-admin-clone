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
      queryClient.invalidateQueries({ queryKey: ['sponsors'] })
    },
  })
}

export function useUpdateSponsor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateSponsorParams) => eventsService.updateSponsor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] })
    },
  })
}

export function useDeleteSponsor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string | number) => {
      await eventsService.deleteSponsor(id)
      return id  // Return the id for optimistic updates if needed
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] })
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

export function useSponsor(id: string | number) {
  return useQuery({
    queryKey: ['sponsor', id],
    queryFn: () => eventsService.getSponsor(id),
  })
}

export function useSponsors() {
  return useQuery({
    queryKey: ['sponsors'],
    queryFn: () => eventsService.getSponsors(),
  })
} 