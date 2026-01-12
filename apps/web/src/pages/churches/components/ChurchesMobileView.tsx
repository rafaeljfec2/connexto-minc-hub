import type { Church } from '@minc-hub/shared/types'
import { ChurchesSearchBar } from './ChurchesSearchBar'
import { ChurchesMobileListContent } from './ChurchesMobileListContent'

interface ChurchesMobileViewProps {
  readonly churches: Church[]
  readonly isLoading: boolean
  readonly searchTerm: string
  readonly hasFilters: boolean
  readonly onSearchChange: (value: string) => void
  readonly onChurchEdit: (church: Church) => void
  readonly onChurchDelete: (church: Church) => void
  readonly onChurchClick?: (church: Church) => void
  readonly onCreateClick: () => void
}

export function ChurchesMobileView({
  churches,
  isLoading,
  searchTerm,
  hasFilters,
  onSearchChange,
  onChurchEdit,
  onChurchDelete,
  onChurchClick,
  onCreateClick,
}: ChurchesMobileViewProps) {
  return (
    <div className="lg:hidden fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 flex flex-col overflow-hidden bg-gray-50 dark:bg-dark-950">
      <ChurchesSearchBar value={searchTerm} onChange={onSearchChange} />

      <div className="px-4 py-3 bg-white dark:bg-dark-950 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-dark-900 dark:text-dark-50">Igrejas</h2>
          <button
            onClick={onCreateClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nova
          </button>
        </div>
      </div>

      <div className="bg-dark-50 dark:bg-dark-950 flex-1 overflow-y-auto px-4 py-4">
        <ChurchesMobileListContent
          churches={churches}
          isLoading={isLoading}
          hasFilters={hasFilters}
          onChurchEdit={onChurchEdit}
          onChurchDelete={onChurchDelete}
          onChurchClick={onChurchClick}
        />
      </div>
    </div>
  )
}
