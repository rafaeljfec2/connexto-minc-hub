import type { AxiosInstance } from 'axios'
import type { User, ApiResponse } from '../types'

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

type LoginData = { user: User; token?: string; refreshToken?: string } | { user: User }

function isApiResponse<T>(data: unknown): data is ApiResponse<T> {
  return data !== null && typeof data === 'object' && 'success' in data && 'statusCode' in data
}

function extractLoginData(data: LoginData): LoginResponse | null {
  if (!data || typeof data !== 'object' || !('user' in data)) {
    return null
  }

  const user = (data as { user: User }).user
  const token = 'token' in data ? (data as { token?: string }).token : undefined
  const refreshToken =
    'refreshToken' in data ? (data as { refreshToken?: string }).refreshToken : undefined

  return { user, token, refreshToken }
}

async function processApiResponse(
  response: unknown,
  storage: AuthServiceConfig['storage']
): Promise<LoginResponse | null> {
  if (!isApiResponse<LoginData>(response)) {
    return null
  }

  if (!response.success || !response.data) {
    return null
  }

  const loginData = extractLoginData(response.data)
  if (!loginData) {
    return null
  }

  if (loginData.token) {
    await Promise.resolve(storage.setToken(loginData.token))
  }

  return loginData
}

async function processDirectResponse(
  response: unknown,
  storage: AuthServiceConfig['storage']
): Promise<LoginResponse | null> {
  const directData = response as { user?: User; token?: string; refreshToken?: string }

  if (!directData?.user) {
    return null
  }

  if (directData.token) {
    await Promise.resolve(storage.setToken(directData.token))
  }

  return {
    user: directData.user,
    token: directData.token,
    refreshToken: directData.refreshToken,
  }
}

export function createAuthService(config: AuthServiceConfig): AuthService {
  const { api, storage, onUnauthorized } = config

  return {
    async login(email: string, password: string): Promise<LoginResponse> {
      try {
        const response = await api.post<ApiResponse<LoginData>>('/auth/login', {
          email,
          password,
        })

        const apiResult = await processApiResponse(response.data, storage)
        if (apiResult) {
          return apiResult
        }

        const directResult = await processDirectResponse(response.data, storage)
        if (directResult) {
          return directResult
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

          if (apiResponse.success && apiResponse.data?.user) {
            return apiResponse.data.user
          }
        }

        // Fallback for direct format
        const directData = response.data as unknown as { user?: User }
        if (directData?.user) {
          return directData.user
        }

        return null
      } catch (error: unknown) {
        // Don't clear token here - the axios interceptor already handles 401 errors
        // Only log the error for debugging
        const isUnauthorized =
          error &&
          typeof error === 'object' &&
          'response' in error &&
          error.response &&
          typeof error.response === 'object' &&
          'status' in error.response &&
          error.response.status === 401

        if (isUnauthorized) {
          // Token was already cleared by the axios interceptor
          // Just return null without additional actions
          return null
        }

        // For other errors (network, 500, etc.), just log and return null
        // Don't clear token as it might still be valid
        console.error('Error getting current user:', error)
        return null
      }
    },

    async refreshToken(): Promise<LoginResponse> {
      const response = await api.post<
        ApiResponse<{ user: User; token?: string; refreshToken?: string }>
      >('/auth/refresh-token')

      // Handle ApiResponse format
      if (response.data.success && response.data.data) {
        const { user, token, refreshToken } = response.data.data

        if (token) {
          await Promise.resolve(storage.setToken(token))
        }

        return { user, token, refreshToken }
      }

      // Fallback for direct format
      const directData = response.data as unknown as {
        user: User
        token?: string
        refreshToken?: string
      }
      if (directData.user) {
        if (directData.token) {
          await Promise.resolve(storage.setToken(directData.token))
        }
        return {
          user: directData.user,
          token: directData.token,
          refreshToken: directData.refreshToken,
        }
      }

      throw new Error('Invalid response format')
    },
  }
}
