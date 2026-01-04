import { ServiceType } from '@minc-hub/shared/types'

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
] as const

export const SERVICE_TYPES = [
  { value: ServiceType.SUNDAY_MORNING, label: 'Domingo Manhã' },
  { value: ServiceType.SUNDAY_EVENING, label: 'Domingo Noite' },
  { value: ServiceType.WEDNESDAY, label: 'Quarta-feira' },
  { value: ServiceType.FRIDAY, label: 'Sexta-feira' },
  { value: ServiceType.SPECIAL, label: 'Especial' },
] as const

export const ITEMS_PER_PAGE = 10

export function getDayLabel(day: number): string {
  return DAYS_OF_WEEK.find((d) => d.value === day)?.label ?? 'Domingo'
}

export function getServiceTypeLabel(type: ServiceType): string {
  return SERVICE_TYPES.find((t) => t.value === type)?.label ?? type
}
