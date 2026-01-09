import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

// Loose interface compatible with generic SortConfig
interface SortConfigLike {
  key: string | number | symbol | null
  direction: 'asc' | 'desc'
}

interface SortableColumnProps {
  children: React.ReactNode
  sortKey: string
  currentSort: SortConfigLike
  onSort: (key: string) => void
  className?: string
}

export function SortableColumn({
  children,
  sortKey,
  currentSort,
  onSort,
  className = '',
}: SortableColumnProps) {
  const isActive = currentSort.key === sortKey

  let Icon = ArrowUpDown
  let iconClass =
    'text-dark-300 dark:text-dark-600 opacity-0 group-hover:opacity-100 transition-opacity'

  if (isActive) {
    if (currentSort.direction === 'asc') {
      Icon = ArrowUp
      iconClass = 'text-primary-600 dark:text-primary-400'
    } else {
      Icon = ArrowDown
      iconClass = 'text-primary-600 dark:text-primary-400'
    }
  }

  return (
    <button
      type="button"
      className={`flex items-center cursor-pointer select-none group hover:text-dark-900 dark:hover:text-dark-50 bg-transparent border-none p-0 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span>{children}</span>
      <span className="ml-2 flex-shrink-0">
        <Icon className={`h-4 w-4 ${iconClass}`} />
      </span>
    </button>
  )
}
