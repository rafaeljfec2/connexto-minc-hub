import { UserRole } from '@minc-hub/shared/types'
import type { RouteConfig } from './routes.types'

import DashboardPage from '@/pages/DashboardPage'
import PeoplePage from '@/pages/PeoplePage'
import TeamsPage from '@/pages/TeamsPage'
import ServicesPage from '@/pages/ServicesPage'
import SchedulesPage from '@/pages/SchedulesPage'
import MonthlySchedulePage from '@/pages/MonthlySchedulePage'
import CommunicationPage from '@/pages/CommunicationPage'
import ChurchesPage from '@/pages/ChurchesPage'
import MinistriesPage from '@/pages/MinistriesPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import UsersPage from '@/pages/UsersPage'
import SchedulePlanningConfigPage from '@/pages/SchedulePlanningConfigPage'
import CheckinPage from '@/pages/CheckinPage'
import ChatPage from '@/pages/ChatPage'
import ChatDetailPage from '@/pages/ChatDetailPage'

export const protectedRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    component: DashboardPage,
  },
  {
    path: '/people',
    component: PeoplePage,
    allowedRoles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE],
  },
  {
    path: '/teams',
    component: TeamsPage,
    allowedRoles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE],
  },
  {
    path: '/services',
    component: ServicesPage,
    allowedRoles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME],
  },
  {
    path: '/schedules',
    component: SchedulesPage,
    allowedRoles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE],
  },
  {
    path: '/communication',
    component: CommunicationPage,
    allowedRoles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE],
  },
  {
    path: '/churches',
    component: ChurchesPage,
    allowedRoles: [UserRole.PASTOR],
  },
  {
    path: '/users',
    component: UsersPage,
    allowedRoles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME],
  },
  {
    path: '/ministries',
    component: MinistriesPage,
    allowedRoles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME],
  },
  {
    path: '/profile',
    component: ProfilePage,
  },
  {
    path: '/settings',
    component: SettingsPage,
  },
  {
    path: '/monthly-schedules',
    component: MonthlySchedulePage,
    allowedRoles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE],
  },
  {
    path: '/schedule-planning-config',
    component: SchedulePlanningConfigPage,
    allowedRoles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME],
  },
  {
    path: '/checkin',
    component: CheckinPage,
  },
  {
    path: '/chat',
    component: ChatPage,
    allowedRoles: [
      UserRole.PASTOR,
      UserRole.LIDER_DE_TIME,
      UserRole.LIDER_DE_EQUIPE,
      UserRole.SERVO,
    ],
  },
  {
    path: '/chat/:conversationId',
    component: ChatDetailPage,
    allowedRoles: [
      UserRole.PASTOR,
      UserRole.LIDER_DE_TIME,
      UserRole.LIDER_DE_EQUIPE,
      UserRole.SERVO,
    ],
  },
]
