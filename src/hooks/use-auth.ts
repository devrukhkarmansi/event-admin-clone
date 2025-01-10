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
    mutationFn: (data: RequestOtpParams) => authService.requestOtp(data),
  })
} 