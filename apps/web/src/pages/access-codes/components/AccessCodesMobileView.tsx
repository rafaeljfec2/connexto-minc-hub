import type { AccessCode } from '@/hooks/useAccessCodes'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { AccessCodesMobileListContent } from './AccessCodesMobileListContent'
import { AccessCodesSectionHeader } from './AccessCodesSectionHeader'

interface AccessCodesMobileViewProps {
  readonly codes: AccessCode[]
  readonly isLoading: boolean
  readonly searchTerm: string
  readonly hasFilters: boolean
  readonly viewMode: 'grid' | 'list'
  readonly onSearchChange: (value: string) => void
  readonly onViewModeChange: (mode: 'grid' | 'list') => void
  readonly onCreateClick: () => void
  readonly onDeactivate?: (codeId: string) => void
  readonly isDeleting?: boolean
}

export function AccessCodesMobileView({
  codes,
  isLoading,
  searchTerm,
  hasFilters,
  viewMode,
  onSearchChange,
  onViewModeChange,
  onCreateClick,
  onDeactivate,
  isDeleting,
}: AccessCodesMobileViewProps) {
  return (
    <div className="lg:hidden fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 flex flex-col overflow-hidden bg-transparent dark:bg-dark-950">
      <div className="px-4 pt-4 pb-2">
        <CrudFilters
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por código ou escopo..."
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      </div>

      <AccessCodesSectionHeader onCreateClick={onCreateClick} />

      <div className="bg-transparent dark:bg-dark-950 flex-1 overflow-y-auto px-4 py-4">
        <AccessCodesMobileListContent
          codes={codes}
          isLoading={isLoading}
          hasFilters={hasFilters}
          onDeactivate={onDeactivate}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  )
}
