import { api } from '@/lib/api'
import { RequestOtpParams, VerifyOtpParams, TokenResponse, User } from './types'
// import { ApiResponse } from '../common/types'

export const authService = {
  requestOtp: async (data: RequestOtpParams) => {
    const response = await api.post('/auth/request-otp', data)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }
    return response.json()
  },

  verifyOtp: async (params: VerifyOtpParams): Promise<TokenResponse> => {
    const response = await api.post('/auth/verify-otp', params)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }
    
    const data = await response.json()
    
    // Validate response data
    if (!data.access_token || !data.refresh_token || !data.user) {
      throw new Error('Invalid response from server')
    }
    
    return data
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