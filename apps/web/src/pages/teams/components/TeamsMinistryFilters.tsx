import type { Ministry } from '@minc-hub/shared/types'

interface TeamsMinistryFiltersProps {
  readonly ministries: Ministry[]
  readonly selectedMinistryId: string
  readonly onSelect: (ministryId: string) => void
}

export function TeamsMinistryFilters({
  ministries,
  selectedMinistryId,
  onSelect,
}: TeamsMinistryFiltersProps) {
  return (
    <div className="px-4 pb-3 bg-transparent dark:bg-dark-950 overflow-x-auto flex-shrink-0">
      <div className="flex gap-2">
        <button
          onClick={() => onSelect('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedMinistryId === 'all'
              ? 'bg-dark-900 dark:bg-dark-50 text-white dark:text-dark-900'
              : 'bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300'
          }`}
        >
          Todos
        </button>
        {ministries.map(ministry => (
          <button
            key={ministry.id}
            onClick={() => onSelect(ministry.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedMinistryId === ministry.id
                ? 'bg-dark-900 dark:bg-dark-50 text-white dark:text-dark-900'
                : 'bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300'
            }`}
          >
            {ministry.name}
          </button>
        ))}
      </div>
    </div>
  )
}
