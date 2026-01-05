import type { AxiosInstance } from 'axios'
import type { User } from '../types'
import type { ApiResponse } from '../types'

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
      try {
        const response = await api.post<ApiResponse<{ user: User; token?: string; refreshToken?: string }>>('/auth/login', {
          email,
          password,
        })

        // Handle ApiResponse format
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          const apiResponse = response.data as ApiResponse<{ user: User; token?: string; refreshToken?: string } | { user: User }>
          
          if (apiResponse.success && apiResponse.data) {
            // Check if data has user property directly
            if ('user' in apiResponse.data) {
              const user = apiResponse.data.user
              const token = 'token' in apiResponse.data ? apiResponse.data.token : undefined
              const refreshToken = 'refreshToken' in apiResponse.data ? apiResponse.data.refreshToken : undefined

              // Token may come in body (mobile) or cookies (web)
              if (token) {
                await Promise.resolve(storage.setToken(token))
              }

              return { user, token, refreshToken }
            }
          }
        }

        // Fallback for direct format (if not using ApiResponse)
        const directData = response.data as unknown as { user: User; token?: string; refreshToken?: string }
        if (directData && directData.user) {
          if (directData.token) {
            await Promise.resolve(storage.setToken(directData.token))
          }
          return { user: directData.user, token: directData.token, refreshToken: directData.refreshToken }
        }

        throw new Error('Invalid response format')
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
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
        const response = await api.get<ApiResponse<{ user: User }>>('/auth/me')
        
        // Handle ApiResponse format
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          const apiResponse = response.data as ApiResponse<{ user: User }>
          
          if (apiResponse.success && apiResponse.data && apiResponse.data.user) {
            return apiResponse.data.user
          }
        }

        // Fallback for direct format
        const directData = response.data as unknown as { user: User }
        if (directData && directData.user) {
          return directData.user
        }

        return null
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
      const response = await api.post<ApiResponse<{ user: User; token?: string; refreshToken?: string }>>('/auth/refresh-token')

      // Handle ApiResponse format
      if (response.data.success && response.data.data) {
        const { user, token, refreshToken } = response.data.data

        if (token) {
          await Promise.resolve(storage.setToken(token))
        }

        return { user, token, refreshToken }
      }

      // Fallback for direct format
      const directData = response.data as unknown as { user: User; token?: string; refreshToken?: string }
      if (directData.user) {
        if (directData.token) {
          await Promise.resolve(storage.setToken(directData.token))
        }
        return { user: directData.user, token: directData.token, refreshToken: directData.refreshToken }
      }

      throw new Error('Invalid response format')
    },
  }
}
