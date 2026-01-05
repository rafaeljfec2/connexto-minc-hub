import { UserRole, ServiceType } from '@minc-hub/shared/types'

export function getRoleLabel(role: UserRole | string): string {
  const roleMap: Record<string, string> = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.COORDINATOR]: 'Coordenador',
    [UserRole.LEADER]: 'Líder',
    [UserRole.MEMBER]: 'Membro',
  }
  return roleMap[role] ?? 'Desconhecido'
}

export function getDayLabel(dayOfWeek: number): string {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  return days[dayOfWeek] ?? 'Desconhecido'
}

export function getServiceTypeLabel(type: ServiceType): string {
  switch (type) {
    case ServiceType.SUNDAY_MORNING:
      return 'Culto Dominical Manhã'
    case ServiceType.SUNDAY_EVENING:
      return 'Culto Dominical Noite'
    case ServiceType.WEDNESDAY:
      return 'Culto de Oração'
    case ServiceType.OTHER:
      return 'Outro'
    default:
      return 'Desconhecido'
  }
}
