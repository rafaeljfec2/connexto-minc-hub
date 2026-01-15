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
    'text-dark-400 dark:text-dark-500 opacity-60 group-hover:opacity-100 transition-opacity'

  if (isActive) {
    if (currentSort.direction === 'asc') {
      Icon = ArrowUp
      iconClass = 'text-primary-600 dark:text-primary-400 opacity-100'
    } else {
      Icon = ArrowDown
      iconClass = 'text-primary-600 dark:text-primary-400 opacity-100'
    }
  }

  return (
    <button
      type="button"
      className={`flex items-center gap-2 cursor-pointer select-none group hover:text-dark-900 dark:hover:text-dark-50 bg-transparent border-none p-0 m-0 w-full text-left focus:outline-none focus:ring-2 focus:ring-primary-500 rounded ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="flex-1">{children}</span>
      <span className="flex-shrink-0">
        <Icon className={`h-4 w-4 ${iconClass}`} />
      </span>
    </button>
  )
}
