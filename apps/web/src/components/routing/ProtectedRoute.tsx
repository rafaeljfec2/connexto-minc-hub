import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useMockMode } from '@/hooks/useMockMode'
import { UserRole } from '@/types'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  readonly children: ReactNode
  readonly allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth()
  const isMockMode = useMockMode()

  if (isLoading && !isMockMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grain">
        <div className="text-dark-400">Carregando...</div>
      </div>
    )
  }

  if (!isAuthenticated && !isMockMode) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !hasAnyRole(allowedRoles) && !isMockMode) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
