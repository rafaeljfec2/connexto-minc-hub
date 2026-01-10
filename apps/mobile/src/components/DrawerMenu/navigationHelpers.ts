import type { RootStackParamList } from '@/navigator/navigator.types'
import type { MenuItem } from './menuItems'

export type NavigableScreens = Exclude<
  keyof RootStackParamList,
  'Login' | 'Main' | 'ChatDetail' | 'GroupDetails'
>

export function getScreenNameForMenuItem(item: MenuItem): NavigableScreens | null {
  if (item.screen) {
    return null
  }

  const screenMap: Record<string, NavigableScreens> = {
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
