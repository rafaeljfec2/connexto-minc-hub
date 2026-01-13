import type { ReactNode } from 'react'
import { UserRole } from '@minc-hub/shared/types'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from './AppLayout'

interface ProtectedRouteWrapperProps {
  readonly children: ReactNode
  readonly allowedRoles?: UserRole[]
}

export function ProtectedRouteWrapper({ children, allowedRoles }: ProtectedRouteWrapperProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}
