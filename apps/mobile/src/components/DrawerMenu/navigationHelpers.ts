import type { RootStackParamList } from '@/navigator/navigator.types'
import type { MenuItem } from './menuItems'

export function getScreenNameForMenuItem(item: MenuItem): keyof RootStackParamList | null {
  if (item.screen) {
    return null
  }

  const screenMap: Record<string, keyof RootStackParamList> = {
    churches: 'Churches',
    ministries: 'Ministries',
    teams: 'Teams',
    people: 'People',
    users: 'Users',
    services: 'Services',
    'monthly-schedules': 'MonthlySchedule',
    communication: 'Communication',
  }

  return screenMap[item.id] ?? null
}
