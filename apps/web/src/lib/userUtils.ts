import { UserRole } from '@minc-hub/shared/types'

export const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: UserRole.ADMIN, label: 'Administrador' },
  { value: UserRole.PASTOR, label: 'Pastor' },
  { value: UserRole.SERVO, label: 'Servo' },
]

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.PASTOR]: 'Pastor',
    [UserRole.SERVO]: 'Servo',
  }
  return labels[role] ?? role
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    [UserRole.ADMIN]:
      'bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30',
    [UserRole.PASTOR]:
      'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
    [UserRole.SERVO]:
      'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
  }
  return colors[role] ?? ''
}
