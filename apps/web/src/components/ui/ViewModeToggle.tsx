import { Button } from '@/components/ui/Button'
import { GridIcon, ListIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'list'

interface ViewModeToggleProps {
  readonly viewMode: ViewMode
  readonly onViewModeChange: (mode: ViewMode) => void
  readonly className?: string
}

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
  className,
}: ViewModeToggleProps) {
  return (
    <div
      className={cn(
        'flex gap-0 border border-dark-200 dark:border-dark-800 rounded-lg overflow-hidden',
        'bg-white dark:bg-dark-900',
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className={cn(
          'flex-1 rounded-none border-0 h-9 px-3',
          viewMode === 'grid'
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'text-dark-600 hover:bg-dark-100 dark:text-dark-300 dark:hover:bg-dark-800'
        )}
      >
        <GridIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('list')}
        className={cn(
          'flex-1 rounded-none border-0 h-9 px-3',
          viewMode === 'list'
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'text-dark-600 hover:bg-dark-100 dark:text-dark-300 dark:hover:bg-dark-800'
        )}
      >
        <ListIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
