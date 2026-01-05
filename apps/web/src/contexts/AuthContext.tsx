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
import { api } from '@/lib/api'

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

  const authService = useMemo(
    () =>
      createAuthService({
        api,
        storage: {
          getToken: () => {
            if (globalThis.window === undefined) return null
            return localStorage.getItem('auth_token')
          },
          setToken: (token: string) => {
            if (globalThis.window === undefined) return
            localStorage.setItem('auth_token', token)
          },
          clearToken: () => {
            if (globalThis.window === undefined) return
            localStorage.removeItem('auth_token')
          },
        },
        onUnauthorized: () => {
          setUser(null)
          // Evita redirecionar se já estamos na tela de login
          if (
            globalThis.window !== undefined &&
            !globalThis.window.location.pathname.includes('/login')
          ) {
            globalThis.window.location.href = '/login'
          }
        },
      }),
    []
  )

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [authService])

  useEffect(() => {
    // Só verifica autenticação uma vez na inicialização
    const token = globalThis.window !== undefined ? localStorage.getItem('auth_token') : null

    // Se não há token, não precisa verificar
    if (token) {
      // Verifica autenticação apenas se houver token
      checkAuth()
    } else {
      setUser(null)
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Executa apenas uma vez na montagem

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await authService.login(email, password)
        setUser(result.user)
      } catch (error) {
        console.error('Erro ao fazer login:', error)
        throw error
      }
    },
    [authService]
  )

  const logout = useCallback(async () => {
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
  }, [authService])

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
