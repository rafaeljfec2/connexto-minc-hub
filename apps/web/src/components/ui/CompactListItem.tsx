import type { ReactNode } from 'react'
import { ItemMenuDropdown, MenuItem } from './ItemMenuDropdown'

interface CompactListItemProps {
  readonly icon?: ReactNode
  readonly iconColor?: string
  readonly title: string
  readonly subtitle?: string
  readonly badge?: {
    text: string
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
  }
  readonly metadata?: string
  readonly onClick?: () => void
  readonly onEdit?: () => void
  readonly onDelete?: () => void
  readonly menuItems?: MenuItem[]
  readonly className?: string
  readonly stacked?: boolean
}

const badgeVariants = {
  success: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  warning: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
  error: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
  info: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  default: 'bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300',
}

export function CompactListItem({
  icon,
  iconColor = 'bg-primary-100 dark:bg-primary-900/20',
  title,
  subtitle,
  badge,
  metadata,
  onClick,
  onEdit,
  onDelete,
  menuItems = [],
  className = '',
  stacked = false,
}: CompactListItemProps) {
  return (
    <div
      className={`w-full flex items-center bg-white dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors ${className}`}
    >
      <button
        type="button"
        className={`flex-1 min-w-0 flex items-center gap-2 py-2 pl-3 text-left focus:outline-none cursor-pointer ${
          onEdit || onDelete || menuItems.length > 0 ? 'pr-2' : 'pr-3'
        }`}
        onClick={onClick}
      >
        {/* Icon */}
        {icon && (
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-md ${iconColor} flex items-center justify-center`}
          >
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-dark-900 dark:text-dark-50 truncate">
            {title}
          </h3>
          {(subtitle || metadata) && (
            <div
              className={`mt-0.5 ${stacked ? 'flex flex-col gap-0.5' : 'flex items-center gap-1.5'}`}
            >
              {subtitle && (
                <span className="text-[10px] text-dark-500 dark:text-dark-400 truncate">
                  {subtitle}
                </span>
              )}
              {!stacked && subtitle && metadata && (
                <span className="text-dark-300 dark:text-dark-600 text-[10px]">•</span>
              )}
              {metadata && (
                <span className="text-[10px] text-dark-500 dark:text-dark-400 truncate">
                  {metadata}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Badge */}
        {badge && (
          <div className="flex-shrink-0">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                badgeVariants[badge.variant || 'default']
              }`}
            >
              {badge.text}
            </span>
          </div>
        )}
      </button>

      {/* Menu Dropdown */}
      {(onEdit || onDelete || menuItems.length > 0) && (
        <div className="pr-2 py-2 flex-shrink-0">
          <ItemMenuDropdown onEdit={onEdit} onDelete={onDelete} menuItems={menuItems} />
        </div>
      )}
    </div>
  )
}
