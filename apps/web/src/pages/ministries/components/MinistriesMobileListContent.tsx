import type { Ministry } from '@minc-hub/shared/types'
import { MinistryListItem } from './MinistryListItem'

interface MinistriesMobileListContentProps {
  readonly ministries: Ministry[]
  readonly getChurchName: (churchId: string) => string
  readonly isLoading: boolean
  readonly hasFilters: boolean
  readonly onMinistryEdit: (ministry: Ministry) => void
  readonly onMinistryDelete: (ministry: Ministry) => void
}

export function MinistriesMobileListContent({
  ministries,
  getChurchName,
  isLoading,
  hasFilters,
  onMinistryEdit,
  onMinistryDelete,
}: MinistriesMobileListContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (ministries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-dark-500 dark:text-dark-400">
          {hasFilters ? 'Nenhum time encontrado' : 'Nenhum time cadastrado'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-900 rounded-lg overflow-hidden border border-dark-200 dark:border-dark-800">
      {ministries.map(ministry => (
        <MinistryListItem
          key={ministry.id}
          ministry={ministry}
          churchName={getChurchName(ministry.churchId)}
          onEdit={onMinistryEdit}
          onDelete={onMinistryDelete}
        />
      ))}
    </div>
  )
}
