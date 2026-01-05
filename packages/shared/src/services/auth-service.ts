import type { AxiosInstance } from 'axios'
import type { User } from '../types'

export interface AuthServiceConfig {
  api: AxiosInstance
  storage: {
    getToken: () => Promise<string | null> | string | null
    setToken: (token: string) => Promise<void> | void
    clearToken: () => Promise<void> | void
  }
  onUnauthorized?: () => void
}

export interface LoginResponse {
  user: User
  token?: string
  refreshToken?: string
}

export interface AuthService {
  login: (email: string, password: string) => Promise<LoginResponse>
  logout: () => Promise<void>
  getCurrentUser: () => Promise<User | null>
  refreshToken: () => Promise<LoginResponse>
}

export function createAuthService(config: AuthServiceConfig): AuthService {
  const { api, storage, onUnauthorized } = config

  return {
    async login(email: string, password: string): Promise<LoginResponse> {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      })

      const { user, token, refreshToken } = response.data

      if (token) {
        await Promise.resolve(storage.setToken(token))
      }

      return { user, token, refreshToken }
    },

    async logout(): Promise<void> {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.error('Error during logout:', error)
      } finally {
        await Promise.resolve(storage.clearToken())
        if (onUnauthorized) {
          onUnauthorized()
        }
      }
    },

    async getCurrentUser(): Promise<User | null> {
      try {
        const response = await api.get<{ user: User }>('/auth/me')
        return response.data.user
      } catch (error) {
        console.error('Error getting current user:', error)
        await Promise.resolve(storage.clearToken())
        if (onUnauthorized) {
          onUnauthorized()
        }
        return null
      }
    },

    async refreshToken(): Promise<LoginResponse> {
      const response = await api.post<LoginResponse>('/auth/refresh-token')

      const { user, token, refreshToken } = response.data

      if (token) {
        await Promise.resolve(storage.setToken(token))
      }

      return { user, token, refreshToken }
    },
  }
}
