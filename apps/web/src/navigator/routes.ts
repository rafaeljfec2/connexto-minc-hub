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

export const protectedRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    component: DashboardPage,
  },
  {
    path: '/people',
    component: PeoplePage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    path: '/teams',
    component: TeamsPage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    path: '/services',
    component: ServicesPage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  {
    path: '/schedules',
    component: SchedulesPage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    path: '/communication',
    component: CommunicationPage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    path: '/churches',
    component: ChurchesPage,
    allowedRoles: [UserRole.ADMIN],
  },
  {
    path: '/users',
    component: UsersPage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  {
    path: '/ministries',
    component: MinistriesPage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR],
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
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
]
