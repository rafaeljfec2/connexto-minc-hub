import { UserRole } from '@/types'

export const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: UserRole.PASTOR, label: 'PASTORr' },
  { value: UserRole.LIDER_DE_TIME, label: 'Líder de Time' },
  { value: UserRole.LIDER_DE_EQUIPE, label: 'Líder de Equipe' },
  { value: UserRole.SERVO, label: 'Servo' },
]

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.PASTOR]: 'PASTORr',
    [UserRole.LIDER_DE_TIME]: 'Líder de Time',
    [UserRole.LIDER_DE_EQUIPE]: 'Líder de Equipe',
    [UserRole.SERVO]: 'Servo',
  }
  return labels[role] ?? role
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    [UserRole.PASTOR]:
      'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
    [UserRole.LIDER_DE_TIME]:
      'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
    [UserRole.LIDER_DE_EQUIPE]:
      'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
    [UserRole.SERVO]:
      'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
  }
  return colors[role] ?? ''
}
