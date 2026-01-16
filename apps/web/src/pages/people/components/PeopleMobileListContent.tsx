import type { Person, Ministry, Team } from '@minc-hub/shared/types'
import { PeopleListItem } from './PeopleListItem'

interface PeopleMobileListContentProps {
  readonly people: Person[]
  readonly getMinistry: (id?: string) => Ministry | undefined
  readonly getTeam: (id?: string) => Team | undefined
  readonly teams: Team[]
  readonly hasUser: (personId: string) => boolean
  readonly isLoading: boolean
  readonly hasFilters: boolean
  readonly onPersonEdit: (person: Person) => void
  readonly onPersonDelete: (id: string) => void
  readonly onCreateUser: (person: Person) => void
  readonly onSendWhatsApp?: (person: Person) => void
}

export function PeopleMobileListContent({
  people,
  getMinistry,
  getTeam,
  teams,
  hasUser,
  isLoading,
  hasFilters,
  onPersonEdit,
  onPersonDelete,
  onCreateUser,
  onSendWhatsApp,
}: PeopleMobileListContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-dark-500 dark:text-dark-400">
          {hasFilters ? 'Nenhum servo encontrado' : 'Nenhum servo cadastrado'}
        </p>
      </div>
    )
  }

  const getPersonTeam = (person: Person): Team | undefined => {
    // Priorizar teamMembers se disponível
    if (person.teamMembers && person.teamMembers.length > 0) {
      const firstTeamId = person.teamMembers[0].teamId
      return teams.find(t => t.id === firstTeamId)
    }
    // Fallback para teamId legado
    return getTeam(person.teamId)
  }

  return (
    <div className="bg-white dark:bg-dark-900 rounded-lg overflow-hidden border border-dark-200 dark:border-dark-800">
      {people.map(person => (
        <PeopleListItem
          key={person.id}
          person={person}
          ministry={getMinistry(person.ministryId)}
          team={getPersonTeam(person)}
          hasUser={hasUser(person.id)}
          onEdit={onPersonEdit}
          onDelete={onPersonDelete}
          onCreateUser={onCreateUser}
          onSendWhatsApp={onSendWhatsApp}
        />
      ))}
    </div>
  )
}
