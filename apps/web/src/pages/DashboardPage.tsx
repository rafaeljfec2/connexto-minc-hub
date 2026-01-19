import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePeopleQuery } from '@/hooks/queries/usePeopleQuery'
import { useTeamsQuery } from '@/hooks/queries/useTeamsQuery'
import { useSchedulesQuery } from '@/hooks/queries/useSchedulesQuery'
import { useServicesQuery } from '@/hooks/queries/useServicesQuery'
import { useMinistriesQuery } from '@/hooks/queries/useMinistriesQuery'
import { User, Person, Team, Schedule, Service, Ministry } from '@minc-hub/shared/types'
import { QuickActionsMobile } from './dashboard/components/QuickActionsMobile'
import { UpcomingServicesMobile } from './dashboard/components/UpcomingServicesMobile'
import { ActivityFeedMobile, type ActivityItem } from './dashboard/components/ActivityFeedMobile'
import { useNextService } from './dashboard/hooks/useNextService'
import { NextServiceCard } from './dashboard/components/NextServiceCard'
import { StatsCards } from './dashboard/components/StatsCards'
import { StatsCardMobile } from './dashboard/components/StatsCardMobile'
import { DashboardHeader } from './dashboard/components/DashboardHeader'
import { EmptyStateCard } from './dashboard/components/EmptyStateCard'

const AttendanceIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

function MobileDashboard({
  people,
  teams,
  ministries,
  activeTeams,
  schedules,
  services,
  activities,
  nextService,
  nextServiceData,
}: {
  readonly people: readonly Person[]
  readonly teams: readonly Team[]
  readonly ministries: readonly Ministry[]
  readonly activeTeams: readonly Team[]
  readonly schedules: readonly Schedule[]
  readonly services: readonly Service[]
  readonly activities: readonly ActivityItem[]
  readonly nextService: Schedule | undefined
  readonly nextServiceData: Service | undefined | null
}) {
  return (
    <div className="lg:hidden flex flex-col min-h-screen bg-transparent dark:bg-dark-950">
      <div className="flex-1 pb-24 pt-4">
        <UpcomingServicesMobile
          schedules={schedules}
          services={services}
          teams={teams}
          ministries={ministries}
          people={people}
        />

        <QuickActionsMobile />

        <div className="px-4 space-y-4 mb-6">
          <StatsCards people={people} activeTeams={activeTeams} variant="mobile" />
          <div className="flex gap-4">
            <StatsCardMobile title="Presença" value="85%" icon={<AttendanceIcon />} trend="+5%" />
            <NextServiceCard schedule={nextService} service={nextServiceData} variant="mobile" />
          </div>
        </div>

        <ActivityFeedMobile activities={activities} />
      </div>
    </div>
  )
}

function DesktopDashboard({
  user,
  people,
  activeTeams,
  nextService,
  nextServiceData,
}: {
  readonly user: User | null
  readonly people: readonly Person[]
  readonly activeTeams: readonly Team[]
  readonly nextService: Schedule | undefined
  readonly nextServiceData: Service | undefined | null
}) {
  return (
    <main className="hidden lg:block container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader user={user} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCards people={people} activeTeams={activeTeams} variant="desktop" />
        <NextServiceCard schedule={nextService} service={nextServiceData} variant="desktop" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmptyStateCard title="Atividades Recentes" message="Nenhuma atividade recente" />
        <EmptyStateCard title="Próximas Escalas" message="Nenhuma escala agendada" />
      </div>
    </main>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { people } = usePeopleQuery()
  const { teams } = useTeamsQuery()
  const { schedules } = useSchedulesQuery()
  const { services } = useServicesQuery()
  const { ministries } = useMinistriesQuery()

  const activeTeams = useMemo(() => teams.filter(t => t.isActive), [teams])
  const activities: ActivityItem[] = []

  const { schedule: nextService, service: nextServiceData } = useNextService(schedules, services)

  return (
    <>
      <MobileDashboard
        people={people}
        teams={teams}
        ministries={ministries}
        activeTeams={activeTeams}
        schedules={schedules}
        services={services}
        activities={activities}
        nextService={nextService}
        nextServiceData={nextServiceData}
      />
      <DesktopDashboard
        user={user}
        people={people}
        activeTeams={activeTeams}
        nextService={nextService}
        nextServiceData={nextServiceData}
      />
    </>
  )
}
