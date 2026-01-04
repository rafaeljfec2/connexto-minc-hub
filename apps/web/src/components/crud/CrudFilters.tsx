import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ViewModeToggle } from '@/components/ui/ViewModeToggle'
import { SearchIcon } from '@/components/icons'

type ViewMode = 'grid' | 'list'

interface FilterOption {
  readonly value: string
  readonly label: string
}

interface CrudFiltersProps {
  readonly searchTerm: string
  readonly onSearchChange: (value: string) => void
  readonly searchPlaceholder?: string
  readonly filters?: Array<{
    readonly value: string
    readonly onChange: (value: string) => void
    readonly options: FilterOption[]
    readonly disabled?: boolean
  }>
  readonly viewMode?: ViewMode
  readonly onViewModeChange?: (mode: ViewMode) => void
}

export function CrudFilters({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
  viewMode,
  onViewModeChange,
}: CrudFiltersProps) {
  const hasViewToggle = viewMode !== undefined && onViewModeChange !== undefined

  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-500 dark:text-dark-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {filters.map((filter, index) => (
            <div key={index} className="w-full sm:w-auto">
              <Select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                disabled={filter.disabled}
                options={filter.options}
              />
            </div>
          ))}

          {hasViewToggle && (
            <div className="hidden md:flex shrink-0">
              <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
