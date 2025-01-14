import { api } from '@/lib/api'
import { RequestOtpParams, VerifyOtpParams, TokenResponse, User } from './types'

export const authService = {
  requestOtp: async (data: RequestOtpParams) => {
    return api.post<{ message: string }>('/auth/request-otp', data)
  },

  verifyOtp: async (params: VerifyOtpParams): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/verify-otp', params)
    
    // Validate response data
    if (!response.access_token || !response.refresh_token || !response.user) {
      throw new Error('Invalid response from server')
    }
    
    return response
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
   return await api.post<TokenResponse>('/auth/refresh', { refreshToken })
  },

  getProfile: async (): Promise<User> => {
   return await api.get<User>('/user/me')
  }
} 