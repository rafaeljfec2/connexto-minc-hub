import type { Person, Ministry, Team } from '@minc-hub/shared/types'
import { PeopleSearchBar } from './PeopleSearchBar'
import { PeopleMobileListContent } from './PeopleMobileListContent'
import { PlusIcon } from '@/components/icons'

interface PeopleMobileViewProps {
  readonly people: Person[]
  readonly getMinistry: (id?: string) => Ministry | undefined
  readonly getTeam: (id?: string) => Team | undefined
  readonly hasUser: (personId: string) => boolean
  readonly isLoading: boolean
  readonly searchTerm: string
  readonly hasFilters: boolean
  readonly onSearchChange: (value: string) => void
  readonly onPersonEdit: (person: Person) => void
  readonly onPersonDelete: (id: string) => void
  readonly onCreateUser: (person: Person) => void
  readonly onCreateClick: () => void
}

export function PeopleMobileView({
  people,
  getMinistry,
  getTeam,
  hasUser,
  isLoading,
  searchTerm,
  hasFilters,
  onSearchChange,
  onPersonEdit,
  onPersonDelete,
  onCreateUser,
  onCreateClick,
}: PeopleMobileViewProps) {
  return (
    <div className="lg:hidden fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 flex flex-col overflow-hidden bg-gray-50 dark:bg-dark-950">
      <PeopleSearchBar value={searchTerm} onChange={onSearchChange} />

      <div className="px-4 py-3 bg-white dark:bg-dark-950 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-dark-900 dark:text-dark-50">Servos</h2>
          <button
            onClick={onCreateClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Novo
          </button>
        </div>
      </div>

      <div className="bg-dark-50 dark:bg-dark-950 flex-1 overflow-y-auto px-4 py-4">
        <PeopleMobileListContent
          people={people}
          getMinistry={getMinistry}
          getTeam={getTeam}
          hasUser={hasUser}
          isLoading={isLoading}
          hasFilters={hasFilters}
          onPersonEdit={onPersonEdit}
          onPersonDelete={onPersonDelete}
          onCreateUser={onCreateUser}
        />
      </div>
    </div>
  )
}
