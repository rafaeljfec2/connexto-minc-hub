import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ItemsPerPageSelectorProps {
  value: number
  onChange: (value: number) => void
  options?: number[]
  className?: string
}

const DEFAULT_OPTIONS = [10, 25, 50, 100]

export function ItemsPerPageSelector({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  className,
}: ItemsPerPageSelectorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <label className="text-sm text-dark-600 dark:text-dark-400 whitespace-nowrap">
        Itens por página:
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={cn(
            'appearance-none pl-3 pr-8 py-1.5 text-sm',
            'bg-white dark:bg-dark-800',
            'border border-dark-300 dark:border-dark-700',
            'rounded-md',
            'text-dark-900 dark:text-dark-50',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'cursor-pointer'
          )}
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400 dark:text-dark-500 pointer-events-none" />
      </div>
    </div>
  )
}
