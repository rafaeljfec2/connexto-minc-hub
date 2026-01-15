import { PlusIcon } from '@/components/icons'

interface AccessCodesSectionHeaderProps {
  readonly onCreateClick: () => void
}

export function AccessCodesSectionHeader({ onCreateClick }: AccessCodesSectionHeaderProps) {
  return (
    <div className="px-4 py-3 bg-transparent dark:bg-dark-950 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-dark-900 dark:text-dark-50">Códigos de Acesso</h2>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Novo
        </button>
      </div>
    </div>
  )
}
