import type { Team } from '@minc-hub/shared/types'
import { TeamListItem } from './TeamListItem'

// Using compact list view for better scalability

interface TeamsMobileListContentProps {
  readonly teams: Team[]
  readonly isLoading: boolean
  readonly hasFilters: boolean
  readonly getMinistryName: (ministryId: string) => string
  readonly onTeamEdit: (team: Team) => void
  readonly onTeamDelete: (team: Team) => void
  readonly onTeamClick: (team: Team) => void
  readonly onAddMember?: (team: Team) => void
}

export function TeamsMobileListContent({
  teams,
  isLoading,
  hasFilters,
  getMinistryName,
  onTeamEdit,
  onTeamDelete,
  onTeamClick,
  onAddMember,
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
    <div className="bg-white dark:bg-dark-900 rounded-lg overflow-hidden border border-dark-200 dark:border-dark-800">
      {teams.map(team => (
        <TeamListItem
          key={team.id}
          team={team}
          ministryName={getMinistryName(team.ministryId)}
          onEdit={onTeamEdit}
          onDelete={onTeamDelete}
          onClick={onTeamClick}
          onAddMember={onAddMember}
        />
      ))}
    </div>
  )
}
