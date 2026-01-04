import type { ReactNode } from 'react'
import { UserRole } from '@/types'
import { useMockMode } from '@/hooks/useMockMode'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from './AppLayout'

interface ProtectedRouteWrapperProps {
  readonly children: ReactNode
  readonly allowedRoles?: UserRole[]
}

export function ProtectedRouteWrapper({
  children,
  allowedRoles,
}: ProtectedRouteWrapperProps) {
  const isMockMode = useMockMode()

  if (isMockMode) {
    return <AppLayout>{children}</AppLayout>
  }

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}
