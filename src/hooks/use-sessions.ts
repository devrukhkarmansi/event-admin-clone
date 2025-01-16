import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionsService } from '@/services/sessions/sessions.service'
import { CreateSessionParams, UpdateSessionParams, SessionFilters } from '@/services/sessions/types'

export const useSessions = (filters?: SessionFilters) => {
  return useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => sessionsService.getSessions(filters)
  })
}

export const useSession = (id: number) => {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionsService.getSession(id),
    enabled: !!id
  })
}

export const useCreateSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSessionParams) => sessionsService.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    }
  })
}

export const useUpdateSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateSessionParams) => sessionsService.updateSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    }
  })
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => sessionsService.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    }
  })
} 