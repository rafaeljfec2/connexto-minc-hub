import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserRole } from '@/types'
import { api, apiClient } from '@/lib/api'

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true' || !import.meta.env.VITE_API_URL

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    if (MOCK_MODE) {
      const mockToken = localStorage.getItem('auth_token')
      if (mockToken) {
        setUser(MOCK_USER)
      }
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await api.get<{ user: User }>('/auth/me')
      setUser(response.data.user)
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      localStorage.removeItem('auth_token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    if (MOCK_MODE) {
      const mockToken = 'mock-token-' + Date.now()
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
  }

  function logout() {
    localStorage.removeItem('auth_token')
    setUser(null)
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  function hasAnyRole(roles: UserRole[]): boolean {
    return user ? roles.includes(user.role) : false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
