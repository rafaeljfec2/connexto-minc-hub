/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { User, UserRole } from '@minc-hub/shared/types'
import { createAuthService } from '@minc-hub/shared/services'
import { api } from '@/lib/api'

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }
}

// Rotas públicas que não devem redirecionar para login em caso de 401
const PUBLIC_ROUTES = ['/login', '/activate']

function isPublicRoute(): boolean {
  if (globalThis.window === undefined) return false
  const pathname = globalThis.window.location.pathname
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasAnyRole: (roles: UserRole[]) => boolean
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  readonly children: ReactNode
}

const USER_STORAGE_KEY = 'auth_user'

function getUserFromStorage(): User | null {
  if (globalThis.window === undefined) return null
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

function saveUserToStorage(user: User | null): void {
  if (globalThis.window === undefined) return
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  } catch {
    // Ignore storage errors
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Restaura o usuário do localStorage na inicialização
  const [user, setUser] = useState<User | null>(() => getUserFromStorage())
  const [isLoading, setIsLoading] = useState(true)
  const hasCheckedAuthRef = useRef<boolean>(false)

  const authService = useMemo(() => {
    try {
      return createAuthService({
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
          // Não faz nada se estiver em rota pública
          if (isPublicRoute()) return

          // Só limpa se realmente não houver usuário no storage
          // Isso evita limpar durante verificação inicial se houver usuário salvo
          const storedUser = getUserFromStorage()
          if (!storedUser) {
            setUser(null)
            saveUserToStorage(null)
          }
          // Redireciona para login apenas se não estiver em rota pública
          if (globalThis.window !== undefined) {
            globalThis.window.location.href = '/login'
          }
        },
      })
    } catch (error) {
      console.error('Erro ao criar authService:', error)
      // Retorna um serviço vazio em caso de erro para não quebrar a aplicação
      return createAuthService({
        api,
        storage: {
          getToken: () => null,
          setToken: () => {},
          clearToken: () => {},
        },
      })
    }
  }, [])

  const checkAuth = useCallback(async () => {
    // Primeiro, garante que o usuário do storage está no estado
    const storedUser = getUserFromStorage()
    if (storedUser) {
      setUser(storedUser)
    }

    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        saveUserToStorage(currentUser)
      } else if (!storedUser) {
        // Se não retornou usuário e não há no storage, limpa
        setUser(null)
        saveUserToStorage(null)
      }
      // Se há usuário no storage mas API não retornou, mantém o usuário do storage
      // Pode ser um erro temporário da API
    } catch (error: unknown) {
      console.error('Erro ao verificar autenticação:', error)
      // Verifica se é erro 401 (não autorizado)
      // Check if it's an unauthorized error (401)
      const status = (error as { response?: { status?: number } })?.response?.status
      const isUnauthorized = status === 401

      // Só limpa o usuário se for realmente não autorizado
      // E não estiver em uma rota pública
      if (isUnauthorized && !isPublicRoute()) {
        setUser(null)
        saveUserToStorage(null)

        // Redireciona para login apenas se não estiver em rota pública
        if (globalThis.window !== undefined) {
          globalThis.window.location.href = '/login'
        }
      }
      // Para outros erros, mantém o usuário do storage (pode ser erro temporário)
      // O usuário já foi restaurado do storage no início da função
    } finally {
      setIsLoading(false)
    }
  }, [authService]) // Removed user from deps to prevent loops

  useEffect(() => {
    // Prevent duplicate calls
    if (hasCheckedAuthRef.current) {
      return
    }

    // Sempre verifica autenticação na inicialização
    // Quando usa cookies, não precisa verificar localStorage
    // A API vai retornar o usuário se estiver autenticado via cookies
    hasCheckedAuthRef.current = true
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Executa apenas uma vez na montagem

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await authService.login(email, password)
        setUser(result.user)
        saveUserToStorage(result.user)

        // Send token to Native App
        if (globalThis.window.ReactNativeWebView) {
          const token = localStorage.getItem('auth_token')
          if (token) {
            globalThis.window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: 'AUTH_SUCCESS',
                token,
              })
            )
          }
        }
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
      saveUserToStorage(null)

      // Notify Native App to clear token
      if (globalThis.window.ReactNativeWebView) {
        globalThis.window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'AUTH_LOGOUT',
          })
        )
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      setUser(null)
      saveUserToStorage(null)
      if (globalThis.window !== undefined) {
        globalThis.window.location.href = '/login'
      }
    }
  }, [authService])

  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!user) return false
      // Se o usuário é admin, tem acesso a tudo
      const userRole = String(user.role).toLowerCase()
      if (userRole === 'admin') return true
      return roles.includes(user.role)
    },
    [user]
  )

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null
      const updatedUser = { ...prevUser, ...updates }
      saveUserToStorage(updatedUser)
      return updatedUser
    })
  }, [])

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      hasAnyRole,
      updateUser,
    }),
    [user, isLoading, login, logout, hasAnyRole, updateUser]
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
