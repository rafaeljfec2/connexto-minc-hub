import { lazy } from 'react'
import { UserRole } from '@minc-hub/shared/types'
import type { RouteConfig } from './routes.types'

const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const PeoplePage = lazy(() => import('@/pages/PeoplePage'))
const TeamsPage = lazy(() => import('@/pages/TeamsPage'))
const ServicesPage = lazy(() => import('@/pages/ServicesPage'))
const SchedulesPage = lazy(() => import('@/pages/SchedulesPage'))
const MonthlySchedulePage = lazy(() => import('@/pages/MonthlySchedulePage'))
const CommunicationPage = lazy(() => import('@/pages/CommunicationPage'))
const ChurchesPage = lazy(() => import('@/pages/ChurchesPage'))
const MinistriesPage = lazy(() => import('@/pages/MinistriesPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const ChangePasswordPage = lazy(() => import('@/pages/ChangePasswordPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))
const SchedulePlanningConfigPage = lazy(() => import('@/pages/SchedulePlanningConfigPage'))
const CheckinPage = lazy(() => import('@/pages/CheckinPage'))
const ChatPage = lazy(() => import('@/pages/ChatPage'))
const ChatDetailPage = lazy(() => import('@/pages/ChatDetailPage'))
const NewMessagePage = lazy(() => import('@/pages/NewMessagePage'))
const ActivateAccountPage = lazy(() => import('@/pages/ActivateAccountPage'))
const CompleteActivationPage = lazy(() => import('@/pages/CompleteActivationPage'))
const AccessCodesPage = lazy(() => import('@/pages/AccessCodesPage'))
const PersonFormPage = lazy(() => import('@/pages/people/PersonFormPage'))

const TeamDetailsPage = lazy(() => import('@/pages/TeamDetailsPage'))

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
    path: '/people/new',
    component: PersonFormPage,
    allowedRoles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE],
  },
  {
    path: '/people/:id/edit',
    component: PersonFormPage,
    allowedRoles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE],
  },
  {
    path: '/teams/:id',
    component: TeamDetailsPage,
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
    allowedRoles: [
      UserRole.PASTOR,
      UserRole.LIDER_DE_TIME,
      UserRole.LIDER_DE_EQUIPE,
      UserRole.SERVO,
    ],
  },
  {
    path: '/communication',
    component: CommunicationPage,
    allowedRoles: [
      UserRole.PASTOR,
      UserRole.LIDER_DE_TIME,
      UserRole.LIDER_DE_EQUIPE,
      UserRole.SERVO,
    ],
  },
  {
    path: '/communication/new',
    component: NewMessagePage,
    allowedRoles: [
      UserRole.PASTOR,
      UserRole.LIDER_DE_TIME,
      UserRole.LIDER_DE_EQUIPE,
      UserRole.SERVO,
    ],
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
    path: '/change-password',
    component: ChangePasswordPage,
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
  {
    path: '/access-codes',
    component: AccessCodesPage,
    allowedRoles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE],
  },
]

export const publicRoutes: RouteConfig[] = [
  {
    path: '/activate',
    component: ActivateAccountPage,
  },
  {
    path: '/activate/complete',
    component: CompleteActivationPage,
  },
]
