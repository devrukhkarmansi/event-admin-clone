import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from './api'

interface ApiError {
  message: string;
  statusCode: number;
}

function handleApiError(error: unknown) {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as ApiError).message
  }
  return 'Something went wrong'
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await api.get('/user/me')
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message)
        }
        return response.json()
      } catch (error) {
        throw new Error(handleApiError(error))
      }
    },
  })
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (data: { 
      recipient: string
      code: string
      channel: 'email' | 'phone'
      countryCode?: string 
    }) => {
      try {
        const response = await api.post('/auth/verify-otp', data)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message)
        }
        return response.json()
      } catch (error) {
        throw new Error(handleApiError(error))
      }
    }
  })
}

export function useRequestOtp() {
  return useMutation({
    mutationFn: async (data: {
      recipient: string
      channel: 'email' | 'phone'
      countryCode?: string
    }) => {
      try {
        const response = await api.post('/auth/request-otp', data)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message)
        }
        return response.json()
      } catch (error) {
        throw new Error(handleApiError(error))
      }
    }
  })
} 