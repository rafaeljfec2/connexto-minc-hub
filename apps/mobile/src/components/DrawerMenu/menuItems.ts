import type { Ionicons } from '@expo/vector-icons'

export interface MenuItem {
  id: string
  label: string
  iconName: keyof typeof Ionicons.glyphMap
  screen?: 'Dashboard' | 'Schedules' | 'Checkin' | 'Chat' | 'Profile'
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    iconName: 'home',
    screen: 'Dashboard',
  },
  {
    id: 'churches',
    label: 'Igrejas',
    iconName: 'business',
  },
  {
    id: 'ministries',
    label: 'Times',
    iconName: 'people',
  },
  {
    id: 'teams',
    label: 'Equipes',
    iconName: 'people-circle',
  },
  {
    id: 'people',
    label: 'Servos',
    iconName: 'person',
  },
  {
    id: 'users',
    label: 'Usuários',
    iconName: 'person-circle',
  },
  {
    id: 'services',
    label: 'Cultos',
    iconName: 'calendar',
  },
  {
    id: 'schedules',
    label: 'Escalas',
    iconName: 'calendar-outline',
    screen: 'Schedules',
  },
  {
    id: 'monthly-schedules',
    label: 'Sorteio Mensal',
    iconName: 'dice',
  },
  {
    id: 'communication',
    label: 'Comunicação',
    iconName: 'chatbubbles',
  },
  {
    id: 'profile',
    label: 'Perfil',
    iconName: 'settings',
    screen: 'Profile',
  },
]
