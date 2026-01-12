import type { Ministry } from '@minc-hub/shared/types'
import { MinistriesSearchBar } from './MinistriesSearchBar'
import { MinistriesMobileListContent } from './MinistriesMobileListContent'
import { PlusIcon } from '@/components/icons'

interface MinistriesMobileViewProps {
  readonly ministries: Ministry[]
  readonly getChurchName: (churchId: string) => string
  readonly isLoading: boolean
  readonly searchTerm: string
  readonly hasFilters: boolean
  readonly onSearchChange: (value: string) => void
  readonly onMinistryEdit: (ministry: Ministry) => void
  readonly onMinistryDelete: (ministry: Ministry) => void
  readonly onCreateClick: () => void
}

export function MinistriesMobileView({
  ministries,
  getChurchName,
  isLoading,
  searchTerm,
  hasFilters,
  onSearchChange,
  onMinistryEdit,
  onMinistryDelete,
  onCreateClick,
}: MinistriesMobileViewProps) {
  return (
    <div className="lg:hidden fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 flex flex-col overflow-hidden bg-gray-50 dark:bg-dark-950">
      <MinistriesSearchBar value={searchTerm} onChange={onSearchChange} />

      <div className="px-4 py-3 bg-white dark:bg-dark-950 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-dark-900 dark:text-dark-50">Times</h2>
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
        <MinistriesMobileListContent
          ministries={ministries}
          getChurchName={getChurchName}
          isLoading={isLoading}
          hasFilters={hasFilters}
          onMinistryEdit={onMinistryEdit}
          onMinistryDelete={onMinistryDelete}
        />
      </div>
    </div>
  )
}
