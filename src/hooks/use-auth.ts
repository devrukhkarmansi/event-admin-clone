import { useQuery, useMutation } from '@tanstack/react-query'
import { authService } from '@/services'
import type { RequestOtpParams, VerifyOtpParams } from '@/services/auth/types'

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => authService.getProfile(),
  })
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (data: VerifyOtpParams) => authService.verifyOtp(data),
  })
}

export function useRequestOtp() {
  return useMutation({
    mutationFn: async (data: RequestOtpParams) => {
      try {
        const response = await authService.requestOtp(data)
        return response
      } catch (error) {
        // Ensure the error is propagated
        throw error
      }
    },
    // Add onError handler
    onError: (error) => {
      console.error('Request OTP Error:', error)
      return false
    }
  })
} 