import type { Person, Ministry, Team } from '@minc-hub/shared/types'
import { PeopleSearchBar } from './PeopleSearchBar'
import { PeopleMobileListContent } from './PeopleMobileListContent'
import { Pagination } from '@/components/ui/Pagination'
import { ItemsPerPageSelector } from '@/components/ui/ItemsPerPageSelector'
import { PlusIcon } from '@/components/icons'
import { Upload } from 'lucide-react'

interface PeopleMobileViewProps {
  readonly people: Person[]
  readonly getMinistry: (id?: string) => Ministry | undefined
  readonly getTeam: (id?: string) => Team | undefined
  readonly teams: Team[]
  readonly hasUser: (personId: string) => boolean
  readonly isLoading: boolean
  readonly searchTerm: string
  readonly hasFilters: boolean
  readonly onSearchChange: (value: string) => void
  readonly onPersonEdit: (person: Person) => void
  readonly onPersonDelete: (id: string) => void
  readonly onCreateUser: (person: Person) => void
  readonly onSendWhatsApp?: (person: Person) => void
  readonly onCreateClick: () => void
  readonly onImportClick?: () => void
  // Pagination props
  readonly currentPage: number
  readonly totalPages: number
  readonly onPageChange: (page: number) => void
  readonly itemsPerPage: number
  readonly onItemsPerPageChange: (itemsPerPage: number) => void
  readonly totalItems: number
}

export function PeopleMobileView({
  people,
  getMinistry,
  getTeam,
  teams,
  hasUser,
  isLoading,
  searchTerm,
  hasFilters,
  onSearchChange,
  onPersonEdit,
  onPersonDelete,
  onCreateUser,
  onSendWhatsApp,
  onCreateClick,
  onImportClick,
  // Pagination props
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}: PeopleMobileViewProps) {
  const paginationControls =
    !isLoading && totalItems > 0 ? (
      <div className="flex flex-col gap-2 px-3 py-2 border-t border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 flex-shrink-0">
        <ItemsPerPageSelector
          value={itemsPerPage}
          onChange={value => {
            onItemsPerPageChange(value)
            onPageChange(1)
          }}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      </div>
    ) : undefined

  return (
    <div className="lg:hidden fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 flex flex-col overflow-hidden bg-transparent dark:bg-dark-950">
      <PeopleSearchBar value={searchTerm} onChange={onSearchChange} />

      <div className="px-3 py-2 bg-transparent dark:bg-dark-950 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-dark-900 dark:text-dark-50">Servos</h2>
          <div className="flex items-center gap-1.5">
            {onImportClick && (
              <button
                onClick={onImportClick}
                className="flex items-center gap-1 px-2 py-1 bg-dark-200 dark:bg-dark-700 hover:bg-dark-300 dark:hover:bg-dark-600 text-dark-900 dark:text-dark-50 text-xs font-medium rounded-md transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Importar</span>
              </button>
            )}
            <button
              onClick={onCreateClick}
              className="flex items-center gap-1 px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-md transition-colors"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Novo
            </button>
          </div>
        </div>
      </div>

      <div className="bg-transparent dark:bg-dark-950 flex-1 overflow-y-auto px-3 py-2">
        <PeopleMobileListContent
          people={people}
          getMinistry={getMinistry}
          getTeam={getTeam}
          teams={teams}
          hasUser={hasUser}
          isLoading={isLoading}
          hasFilters={hasFilters}
          onPersonEdit={onPersonEdit}
          onPersonDelete={onPersonDelete}
          onCreateUser={onCreateUser}
          onSendWhatsApp={onSendWhatsApp}
        />
      </div>

      {paginationControls}
    </div>
  )
}
