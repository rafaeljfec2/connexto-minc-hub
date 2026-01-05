import { useState, useEffect, useCallback, useMemo } from 'react'
import { User } from '@minc-hub/shared/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAuthService } from '@minc-hub/shared/services'
import { api, apiClient } from '@/lib/api'
import { API_CONFIG, STORAGE_KEYS } from '@/constants/config'
import { MOCK_USER } from '@/constants/mockData'

interface UseAuthStateReturn {
  user: User | null
  isLoading: boolean
  checkAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export function useAuthState(): UseAuthStateReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const authService = useMemo(
    () =>
      createAuthService({
        api,
        storage: {
          getToken: async () => {
            try {
              return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
            } catch (error) {
              console.error('Error getting token:', error)
              return null
            }
          },
          setToken: async (token: string) => {
            try {
              await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
              apiClient.setToken(token)
            } catch (error) {
              console.error('Error setting token:', error)
            }
          },
          clearToken: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
              apiClient.setToken('')
            } catch (error) {
              console.error('Error clearing token:', error)
            }
          },
        },
      }),
    []
  )

  const checkAuth = useCallback(async () => {
    if (API_CONFIG.MOCK_MODE) {
      await checkMockAuth(setUser, setIsLoading)
      return
    }

    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error checking auth:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [authService])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(
    async (email: string, password: string) => {
      if (API_CONFIG.MOCK_MODE) {
        await performMockLogin(setUser)
        return
      }

      try {
        const result = await authService.login(email, password)
        setUser(result.user)
      } catch (error) {
        console.error('Error during login:', error)
        throw error
      }
    },
    [authService]
  )

  const logout = useCallback(async () => {
    if (API_CONFIG.MOCK_MODE) {
      await performLogout(setUser)
      return
    }

    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Error during logout:', error)
      setUser(null)
    }
  }, [authService])

  return {
    user,
    isLoading,
    checkAuth,
    login,
    logout,
  }
}

async function checkMockAuth(
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
): Promise<void> {
  try {
    const mockToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (mockToken) {
      setUser(MOCK_USER)
    }
  } catch (error) {
    console.error('Error checking mock auth:', error)
  } finally {
    setIsLoading(false)
  }
}

async function performMockLogin(setUser: (user: User | null) => void): Promise<void> {
  const mockToken = `mock-token-${Date.now()}`
  apiClient.setToken(mockToken)
  setUser(MOCK_USER)
}

async function performLogout(setUser: (user: User | null) => void): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  apiClient.setToken('')
  setUser(null)
}
