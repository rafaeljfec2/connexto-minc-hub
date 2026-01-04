import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import { User, UserRole } from '@minc-hub/shared/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api, apiClient } from '@/lib/api'
import { createApiServices } from '@minc-hub/shared/services'

export const {
  peopleService,
  teamsService,
  servicesService,
  schedulesService,
  attendanceService,
  communicationService,
  churchesService,
  ministriesService,
} = createApiServices(api)

const MOCK_MODE = process.env.EXPO_PUBLIC_MOCK_MODE === 'true' || !process.env.EXPO_PUBLIC_API_URL

const MOCK_USER: User = {
  id: 'mock-user-1',
  email: 'admin@minc.com',
  name: 'Usuário Admin',
  role: UserRole.ADMIN,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasAnyRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  readonly children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    if (MOCK_MODE) {
      try {
        const mockToken = await AsyncStorage.getItem('auth_token')
        if (mockToken) {
          setUser(MOCK_USER)
        }
      } catch {
        // Handle error
      }
      setIsLoading(false)
      return
    }

    try {
      const token = await AsyncStorage.getItem('auth_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await api.get<{ user: User }>('/auth/me')
      setUser(response.data.user)
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      await AsyncStorage.removeItem('auth_token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    if (MOCK_MODE) {
      const mockToken = `mock-token-${Date.now()}`
      apiClient.setToken(mockToken)
      setUser(MOCK_USER)
      return
    }

    const response = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    })

    apiClient.setToken(response.data.token)
    setUser(response.data.user)
  }, [])

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('auth_token')
    setUser(null)
  }, [])

  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      return user ? roles.includes(user.role) : false
    },
    [user]
  )

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      hasAnyRole,
    }),
    [user, isLoading, login, logout, hasAnyRole]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
