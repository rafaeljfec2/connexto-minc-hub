import type { AccessCode } from '@/hooks/useAccessCodes'
import { AccessCodeListItem } from './AccessCodeListItem'

interface AccessCodesMobileListContentProps {
  readonly codes: AccessCode[]
  readonly isLoading: boolean
  readonly hasFilters: boolean
  readonly onDeactivate?: (codeId: string) => void
  readonly isDeleting?: boolean
}

export function AccessCodesMobileListContent({
  codes,
  isLoading,
  hasFilters,
  onDeactivate,
  isDeleting,
}: AccessCodesMobileListContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (codes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-dark-500 dark:text-dark-400">
          {hasFilters ? 'Nenhum código encontrado' : 'Nenhum código criado ainda'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-900 rounded-lg overflow-hidden border border-dark-200 dark:border-dark-800">
      {codes.map(code => (
        <AccessCodeListItem
          key={code.id}
          code={code}
          onDeactivate={onDeactivate}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  )
}
