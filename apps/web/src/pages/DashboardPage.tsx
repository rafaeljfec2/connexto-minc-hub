import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { usePeople } from '@/hooks/usePeople'
import { useTeams } from '@/hooks/useTeams'
import { useSchedules } from '@/hooks/useSchedules'
import { useServices } from '@/hooks/useServices'
import { QuickActionsMobile } from './dashboard/components/QuickActionsMobile'
import { StatsCardMobile } from './dashboard/components/StatsCardMobile'
import { UpcomingServicesMobile } from './dashboard/components/UpcomingServicesMobile'
import { ActivityFeedMobile, type ActivityItem } from './dashboard/components/ActivityFeedMobile'

export default function DashboardPage() {
  const { user } = useAuth()
  const { people } = usePeople()
  const { teams } = useTeams()
  const { schedules } = useSchedules()
  const { services } = useServices()

  const activeTeams = useMemo(() => teams.filter(t => t.isActive), [teams])

  // Mock activities for now
  const activities: ActivityItem[] = []

  const upcomingSchedules = useMemo(() => {
    return schedules
      .filter(schedule => {
        const scheduleDate = new Date(schedule.date)
        return scheduleDate >= new Date()
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 1)
  }, [schedules])

  const nextService = upcomingSchedules[0]
  const nextServiceData = nextService
    ? services.find(s => s.id === nextService.serviceId)
    : null

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto pb-20 pt-4">
          <QuickActionsMobile />
          <div className="px-4 space-y-4 mb-6">
            <div className="flex gap-4">
              <StatsCardMobile
                title="Total Servos"
                value={people.length}
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                }
                trend="+2 novos"
              />
              <StatsCardMobile
                title="Equipes"
                value={activeTeams.length}
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                }
              />
            </div>
            <div className="flex gap-4">
              <StatsCardMobile
                title="Próx. Culto"
                value={
                  nextServiceData
                    ? new Date(nextService.date).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'
                }
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
              />
              <StatsCardMobile
                title="Presença"
                value="85%"
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                }
                trend="+5%"
              />
            </div>
          </div>
          <UpcomingServicesMobile schedules={schedules} services={services} />
          <ActivityFeedMobile activities={activities} />
        </div>
      </div>

      {/* Desktop View */}
      <main className="hidden lg:block container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-50 mb-2">
            Dashboard
          </h1>
          <p className="text-dark-600 dark:text-dark-400">
            Bem-vindo, {user?.name ?? 'Usuário'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium text-dark-600 dark:text-dark-400">
                Total de Servos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-dark-900 dark:text-dark-50">
                {people.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium text-dark-600 dark:text-dark-400">
                Equipes Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-dark-900 dark:text-dark-50">
                {activeTeams.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium text-dark-600 dark:text-dark-400">
                Próximo Culto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-dark-900 dark:text-dark-50">
                {nextServiceData
                  ? new Date(nextService.date).toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium text-dark-600 dark:text-dark-400">
                Presença (Mês)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-dark-900 dark:text-dark-50">0%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-dark-600 dark:text-dark-400">
                Nenhuma atividade recente
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Escalas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-dark-600 dark:text-dark-400">
                Nenhuma escala agendada
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
