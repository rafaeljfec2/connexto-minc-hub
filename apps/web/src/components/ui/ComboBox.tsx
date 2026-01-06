import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import * as React from 'react'
import { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger } from './select-radix'

export interface ComboBoxOption<T = string> {
  value: T
  label: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

export interface ComboBoxProps<T = string> {
  /**
   * Options to display in the combobox
   */
  options: ComboBoxOption<T>[]

  /**
   * Current selected value
   */
  value?: T | null

  /**
   * Callback when value changes
   */
  onValueChange?: (value: T | null) => void

  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string

  /**
   * Label for the combobox
   */
  label?: string

  /**
   * Error message to display
   */
  error?: string

  /**
   * Whether the combobox is disabled
   */
  disabled?: boolean

  /**
   * Whether to show search input
   */
  searchable?: boolean

  /**
   * Placeholder for search input
   */
  searchPlaceholder?: string

  /**
   * Maximum height for the dropdown (in viewport units or pixels)
   * Default: 5 items visible (max-h-56)
   */
  maxHeight?: string

  /**
   * Icon to display in the trigger
   */
  icon?: React.ComponentType<{ className?: string }>

  /**
   * Custom className for the trigger
   */
  className?: string

  /**
   * Custom className for the content
   */
  contentClassName?: string

  /**
   * Whether to show "No options" message when empty
   */
  showEmptyMessage?: boolean

  /**
   * Custom empty message
   */
  emptyMessage?: string

  /**
   * Function to format the selected value display
   */
  formatSelectedValue?: (option: ComboBoxOption<T> | undefined) => string

  /**
   * Function to filter options (custom search logic)
   */
  filterOptions?: (options: ComboBoxOption<T>[], searchTerm: string) => ComboBoxOption<T>[]

  /**
   * Custom render function for each option item
   */
  renderItem?: (option: ComboBoxOption<T>) => React.ReactNode

  /**
   * Custom render function for the trigger content
   */
  renderTrigger?: (option: ComboBoxOption<T> | undefined, displayValue: string) => React.ReactNode

  /**
   * Whether to show "Select all" and "Clear" buttons
   */
  showSelectAll?: boolean

  /**
   * Callback when "Select all" is clicked (only for multi-select)
   */
  onSelectAll?: () => void

  /**
   * Callback when "Clear" is clicked
   */
  onClearAll?: () => void
}

/**
 * ComboBox component - A searchable select dropdown with consistent styling
 *
 * @example
 * ```tsx
 * <ComboBox
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' }
 *   ]}
 *   value={selectedValue}
 *   onValueChange={setSelectedValue}
 *   placeholder="Select an option"
 *   searchable
 * />
 * ```
 */
export function ComboBox<T extends string | number = string>({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione...',
  label,
  error,
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  maxHeight = 'max-h-56',
  icon: Icon,
  className,
  contentClassName,
  showEmptyMessage = true,
  emptyMessage = 'Nenhuma opção disponível',
  formatSelectedValue,
  filterOptions,
  renderItem,
  renderTrigger,
  showSelectAll = false,
  onSelectAll,
  onClearAll,
}: Readonly<ComboBoxProps<T>>) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchTerm.trim()) {
      return options
    }

    if (filterOptions) {
      return filterOptions(options, searchTerm)
    }

    // Default filter: case-insensitive search in label
    const term = searchTerm.toLowerCase()
    return options.filter(option => option.label.toLowerCase().includes(term))
  }, [options, searchTerm, searchable, filterOptions])

  // Find selected option
  const selectedOption = React.useMemo(
    () => options.find(opt => opt.value === value),
    [options, value]
  )

  // Format display value
  const displayValue = React.useMemo(() => {
    if (formatSelectedValue) {
      return formatSelectedValue(selectedOption)
    }
    return selectedOption?.label ?? placeholder
  }, [selectedOption, placeholder, formatSelectedValue])

  // Handle value change
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      const option = options.find(opt => String(opt.value) === newValue)
      if (option && !option.disabled) {
        onValueChange?.(option.value)
      } else {
        onValueChange?.(null)
      }
      setSearchTerm('') // Reset search on selection
      setIsOpen(false)
    },
    [options, onValueChange]
  )

  // Handle clear
  const handleClear = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onValueChange?.(null)
      setSearchTerm('')
    },
    [onValueChange]
  )

  // Reset search when dropdown closes
  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const hasValue = value !== null && value !== undefined && selectedOption !== undefined
  const selectId = React.useId()

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5"
        >
          {label}
        </label>
      )}

      <Select
        value={hasValue ? String(value) : undefined}
        onValueChange={handleValueChange}
        disabled={disabled}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger
          className={cn(
            'bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 border-dark-300 dark:border-dark-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all',
            error && 'border-red-500 focus:ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          {renderTrigger ? (
            renderTrigger(selectedOption, displayValue)
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {Icon && <Icon className="h-4 w-4 text-dark-500 dark:text-dark-400 flex-shrink-0" />}
              <span className="truncate text-dark-900 dark:text-dark-50">{displayValue}</span>
            </div>
          )}
          {hasValue && !disabled && !renderTrigger && (
            // Note: Using span instead of button to avoid nested button issue (SelectTrigger is already a button)
            <span
              onClick={handleClear}
              className="ml-2 p-0.5 rounded hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors flex-shrink-0 cursor-pointer"
              aria-label="Limpar seleção"
            >
              <X className="h-3 w-3 text-dark-500 dark:text-dark-400" />
            </span>
          )}
        </SelectTrigger>

        <SelectContent
          className={cn(
            'bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50 border-dark-200 dark:border-dark-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10',
            contentClassName
          )}
        >
          <div className={cn('flex flex-col', maxHeight)}>
            {searchable && (
              <div className="p-2 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full px-2 py-1 text-sm bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-dark-900 dark:text-dark-50 placeholder:text-dark-500 dark:placeholder:text-dark-400"
                  onClick={e => e.stopPropagation()}
                  onKeyDown={e => {
                    // Prevent closing dropdown when typing
                    e.stopPropagation()
                  }}
                  aria-label="Buscar valores"
                />
              </div>
            )}

            {showSelectAll && (onSelectAll || onClearAll) && (
              <div className="p-2 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
                <div className="flex justify-between items-center">
                  {onSelectAll && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        onSelectAll()
                      }}
                      className="text-xs text-primary-500 hover:text-primary-400 dark:text-primary-400 dark:hover:text-primary-300"
                      aria-label="Selecionar todos os valores"
                    >
                      Selecionar todos
                    </button>
                  )}
                  {onClearAll && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        onClearAll()
                      }}
                      className="text-xs text-dark-500 hover:text-dark-600 dark:text-dark-400 dark:hover:text-dark-300"
                      aria-label="Limpar seleção"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>
            )}

            <div
              className={cn(
                'overflow-y-auto scrollbar-thin scrollbar-thumb-dark-300 dark:scrollbar-thumb-dark-600',
                maxHeight,
                searchable && 'p-2 pt-0',
                showSelectAll && (onSelectAll || onClearAll) && 'p-2 pt-0',
                !searchable && !(showSelectAll && (onSelectAll || onClearAll)) && 'p-2'
              )}
              style={{ maxHeight: maxHeight === 'max-h-56' ? '14rem' : undefined }}
              onWheel={e => {
                const element = e.currentTarget
                const { scrollTop, scrollHeight, clientHeight } = element
                const isScrollingDown = e.deltaY > 0
                const isScrollingUp = e.deltaY < 0
                const isAtTop = scrollTop === 0
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1

                // Only prevent page scroll if we're not at the boundaries
                if ((isScrollingDown && !isAtBottom) || (isScrollingUp && !isAtTop)) {
                  e.stopPropagation()
                }
              }}
            >
              {filteredOptions.length > 0
                ? filteredOptions.map(option => {
                    if (renderItem) {
                      return (
                        <SelectItem
                          key={String(option.value)}
                          value={String(option.value)}
                          disabled={option.disabled}
                          className="hover:bg-dark-100 dark:hover:bg-dark-800/80 focus:bg-dark-100 dark:focus:bg-dark-800/80 cursor-pointer rounded px-2 py-1.5"
                        >
                          {renderItem(option)}
                        </SelectItem>
                      )
                    }

                    const OptionIcon = option.icon
                    return (
                      <SelectItem
                        key={String(option.value)}
                        value={String(option.value)}
                        disabled={option.disabled}
                        className="hover:bg-dark-100 dark:hover:bg-dark-800/80 focus:bg-dark-100 dark:focus:bg-dark-800/80 cursor-pointer rounded px-2 py-1.5"
                      >
                        {OptionIcon ? (
                          <div className="flex items-center gap-2">
                            <OptionIcon className="h-4 w-4" />
                            <span className="text-sm text-dark-700 dark:text-dark-200">
                              {option.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-dark-700 dark:text-dark-200">
                            {option.label}
                          </span>
                        )}
                      </SelectItem>
                    )
                  })
                : showEmptyMessage && (
                    <div className="px-2 py-2 text-sm text-dark-500 dark:text-dark-400 text-center">
                      {emptyMessage}
                    </div>
                  )}
            </div>
          </div>
        </SelectContent>
      </Select>

      {error && <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}
