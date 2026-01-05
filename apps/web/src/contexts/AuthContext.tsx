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
import { createAuthService } from '@minc-hub/shared/services'
import { api, apiClient } from '@/lib/api'
import { useMockMode } from '@/hooks/useMockMode'

const MOCK_USER: User = {
  id: 'mock-user-1',
  email: 'admin@minc.com',
  name: 'Usuário Admin',
  role: UserRole.PASTOR,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasAnyRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  readonly children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isMockMode = useMockMode()

  const authService = useMemo(
    () =>
      createAuthService({
        api,
        storage: {
          getToken: () => {
            if (typeof window === 'undefined') return null
            return localStorage.getItem('auth_token')
          },
          setToken: (token: string) => {
            if (typeof window === 'undefined') return
            localStorage.setItem('auth_token', token)
          },
          clearToken: () => {
            if (typeof window === 'undefined') return
            localStorage.removeItem('auth_token')
          },
        },
        onUnauthorized: () => {
          setUser(null)
          if (globalThis.window !== undefined) {
            globalThis.window.location.href = '/login'
          }
        },
      }),
    []
  )

  const checkAuth = useCallback(async () => {
    if (isMockMode) {
      const mockToken = localStorage.getItem('auth_token')
      if (mockToken) {
        setUser(MOCK_USER)
      } else {
        const newMockToken = `mock-token-${Date.now()}`
        apiClient.setToken(newMockToken)
        setUser(MOCK_USER)
      }
      setIsLoading(false)
      return
    }

    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [isMockMode, authService])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(
    async (email: string, password: string) => {
      if (isMockMode) {
        const mockToken = `mock-token-${Date.now()}`
        apiClient.setToken(mockToken)
        setUser(MOCK_USER)
        return
      }

      try {
        const result = await authService.login(email, password)
        setUser(result.user)
      } catch (error) {
        console.error('Erro ao fazer login:', error)
        throw error
      }
    },
    [isMockMode, authService]
  )

  const logout = useCallback(async () => {
    if (isMockMode) {
      localStorage.removeItem('auth_token')
      setUser(null)
      if (globalThis.window !== undefined) {
        globalThis.window.location.href = '/login'
      }
      return
    }

    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      setUser(null)
      if (globalThis.window !== undefined) {
        globalThis.window.location.href = '/login'
      }
    }
  }, [isMockMode, authService])

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
