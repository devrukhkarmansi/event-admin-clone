import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/services/auth/types'
import Cookies from 'js-cookie'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setTokens: (tokens: { access_token: string; refresh_token: string }) => void
  clearAuth: () => void
  getAccessToken: () => string | undefined
  getRefreshToken: () => string | undefined
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setTokens: ({ access_token, refresh_token }) => {
        Cookies.set('accessToken', access_token, { 
          secure: true,
          sameSite: 'strict'
        })
        Cookies.set('refreshToken', refresh_token, { 
          secure: true,
          sameSite: 'strict'
        })
      },

      clearAuth: () => {
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        set({ 
          user: null, 
          isAuthenticated: false 
        })
      },

      getAccessToken: () => Cookies.get('accessToken'),
      getRefreshToken: () => Cookies.get('refreshToken'),
    }),
    {
      name: 'auth-storage',
      // Only persist user data in localStorage, not tokens
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
) 