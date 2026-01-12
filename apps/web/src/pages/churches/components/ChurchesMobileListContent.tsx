import type { Church } from '@minc-hub/shared/types'
import { ChurchListItem } from './ChurchListItem'

interface ChurchesMobileListContentProps {
  readonly churches: Church[]
  readonly isLoading: boolean
  readonly hasFilters: boolean
  readonly onChurchEdit: (church: Church) => void
  readonly onChurchDelete: (church: Church) => void
  readonly onChurchClick?: (church: Church) => void
}

export function ChurchesMobileListContent({
  churches,
  isLoading,
  hasFilters,
  onChurchEdit,
  onChurchDelete,
  onChurchClick,
}: ChurchesMobileListContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (churches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-dark-500 dark:text-dark-400">
          {hasFilters ? 'Nenhuma igreja encontrada' : 'Nenhuma igreja cadastrada'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-900 rounded-lg overflow-hidden border border-dark-200 dark:border-dark-800">
      {churches.map(church => (
        <ChurchListItem
          key={church.id}
          church={church}
          onEdit={onChurchEdit}
          onDelete={onChurchDelete}
          onClick={onChurchClick}
        />
      ))}
    </div>
  )
}
