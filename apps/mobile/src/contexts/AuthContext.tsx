import { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react'
import { UserRole } from '@minc-hub/shared/types'
import { useAuthState } from '@/hooks/useAuthState'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'

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

interface AuthContextType {
  user: ReturnType<typeof useAuthState>['user']
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

function hasAnyRole(user: ReturnType<typeof useAuthState>['user'], roles: UserRole[]): boolean {
  return user ? roles.includes(user.role) : false
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isLoading, login, logout } = useAuthState()

  const hasAnyRoleCallback = useCallback(
    (roles: UserRole[]) => hasAnyRole(user, roles),
    [user],
  )

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      hasAnyRole: hasAnyRoleCallback,
    }),
    [user, isLoading, login, logout, hasAnyRoleCallback]
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
