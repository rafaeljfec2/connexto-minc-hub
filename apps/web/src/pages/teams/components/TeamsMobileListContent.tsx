import type { Team } from '@minc-hub/shared/types'
import { TeamItemCard } from './TeamItemCard'

interface TeamsMobileListContentProps {
  readonly teams: Team[]
  readonly isLoading: boolean
  readonly hasFilters: boolean
  readonly getMinistryName: (ministryId: string) => string
  readonly onTeamMenuClick: (team: Team) => void
  readonly onTeamClick: (team: Team) => void
}

export function TeamsMobileListContent({
  teams,
  isLoading,
  hasFilters,
  getMinistryName,
  onTeamMenuClick,
  onTeamClick,
}: TeamsMobileListContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-dark-500 dark:text-dark-400">
          {hasFilters ? 'Nenhuma equipe encontrada' : 'Nenhuma equipe cadastrada'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {teams.map(team => (
        <TeamItemCard
          key={team.id}
          team={team}
          ministryName={getMinistryName(team.ministryId)}
          onMenuClick={onTeamMenuClick}
          onClick={onTeamClick}
        />
      ))}
    </div>
  )
}
