import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/services/auth/types'
import Cookies from 'js-cookie'

interface Tokens {
  access_token: string;
  refresh_token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: Tokens) => void;
  clearAuth: () => void;
  getAccessToken: () => string | undefined;
  getRefreshToken: () => string | undefined;
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
        Cookies.set('accessToken', access_token, { secure: true })
        Cookies.set('refreshToken', refresh_token, { secure: true })
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
    }
  )
) 