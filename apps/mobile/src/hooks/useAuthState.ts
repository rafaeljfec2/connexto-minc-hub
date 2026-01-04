import { useState, useEffect, useCallback } from 'react'
import { User } from '@minc-hub/shared/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
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

  const checkAuth = useCallback(async () => {
    if (API_CONFIG.MOCK_MODE) {
      await checkMockAuth(setUser, setIsLoading)
      return
    }

    await checkRealAuth(setUser, setIsLoading)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(async (email: string, password: string) => {
    if (API_CONFIG.MOCK_MODE) {
      await performMockLogin(setUser)
      return
    }

    await performRealLogin(email, password, setUser)
  }, [])

  const logout = useCallback(async () => {
    await performLogout(setUser)
  }, [])

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

async function checkRealAuth(
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (!token) {
      setIsLoading(false)
      return
    }

    const response = await api.get<{ user: User }>('/auth/me')
    setUser(response.data.user)
  } catch (error) {
    console.error('Error checking auth:', error)
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    setUser(null)
  } finally {
    setIsLoading(false)
  }
}

async function performMockLogin(setUser: (user: User | null) => void): Promise<void> {
  const mockToken = `mock-token-${Date.now()}`
  apiClient.setToken(mockToken)
  setUser(MOCK_USER)
}

async function performRealLogin(
  email: string,
  password: string,
  setUser: (user: User | null) => void
): Promise<void> {
  const response = await api.post<{ token: string; user: User }>('/auth/login', {
    email,
    password,
  })

  apiClient.setToken(response.data.token)
  setUser(response.data.user)
}

async function performLogout(setUser: (user: User | null) => void): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  setUser(null)
}
