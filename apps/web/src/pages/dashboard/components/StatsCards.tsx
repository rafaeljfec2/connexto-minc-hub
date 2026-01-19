import { Person, Team } from '@minc-hub/shared/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatsCardMobile } from './StatsCardMobile'

interface StatsCardsProps {
  readonly people: readonly Person[]
  readonly activeTeams: readonly Team[]
  readonly variant?: 'mobile' | 'desktop'
}

const PeopleIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
)

const TeamsIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </svg>
)

export function StatsCards({ people, activeTeams, variant = 'desktop' }: StatsCardsProps) {
  if (variant === 'mobile') {
    return (
      <div className="flex gap-4">
        <StatsCardMobile
          title="Total Servos"
          value={people.length}
          icon={<PeopleIcon />}
          trend="+2 novos"
        />
        <StatsCardMobile title="Equipes" value={activeTeams.length} icon={<TeamsIcon />} />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-dark-600 dark:text-dark-400">
            Total de Servos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-dark-900 dark:text-dark-50">{people.length}</div>
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
            Presença (Mês)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-dark-900 dark:text-dark-50">0%</div>
        </CardContent>
      </Card>
    </>
  )
}
