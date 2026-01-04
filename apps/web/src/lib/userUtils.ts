import { UserRole } from '@/types'

export const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: UserRole.ADMIN, label: 'Administrador' },
  { value: UserRole.COORDINATOR, label: 'Coordenador' },
  { value: UserRole.LEADER, label: 'Líder' },
  { value: UserRole.MEMBER, label: 'Membro' },
]

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.COORDINATOR]: 'Coordenador',
    [UserRole.LEADER]: 'Líder',
    [UserRole.MEMBER]: 'Membro',
  }
  return labels[role] ?? role
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    [UserRole.ADMIN]:
      'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
    [UserRole.COORDINATOR]:
      'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
    [UserRole.LEADER]:
      'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
    [UserRole.MEMBER]:
      'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
  }
  return colors[role] ?? ''
}
