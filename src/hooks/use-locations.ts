import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { locationsService } from '@/services/locations/locations.service'
import { CreateLocationParams, UpdateLocationParams } from '@/services/locations/types'

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsService.getLocations()
  })
}

export const useLocation = (id: number) => {
  return useQuery({
    queryKey: ['location', id],
    queryFn: () => locationsService.getLocation(id),
    enabled: !!id
  })
}

export const useCreateLocation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLocationParams) => locationsService.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    }
  })
}

export const useUpdateLocation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateLocationParams) => locationsService.updateLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    }
  })
}

export const useDeleteLocation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => locationsService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    }
  })
} 