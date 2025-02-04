import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '@/services/events/events.service'

export function useSponsors() {
  return useQuery({
    queryKey: ['sponsors'],
    queryFn: () => eventsService.getSponsors()
  })
}

export function useDeleteSponsor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventsService.deleteSponsor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] })
    }
  })
} 