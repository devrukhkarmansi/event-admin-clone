import { api } from '@/lib/api'
import { RequestOtpParams, VerifyOtpParams, TokenResponse, User } from './types'
import { ApiResponse } from '../common/types'

export const authService = {
  requestOtp: async (params: RequestOtpParams): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/request-otp', params)
    return response.json()
  },

  verifyOtp: async (params: VerifyOtpParams): Promise<TokenResponse> => {
    const response = await api.post('/auth/verify-otp', params)
    return response.json()
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.json()
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/user/me')
    return response.json()
  }
} 