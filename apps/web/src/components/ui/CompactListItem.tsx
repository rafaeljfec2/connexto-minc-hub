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
}: CompactListItemProps) {
  return (
    <div
      className={`w-full flex items-center bg-white dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors ${className}`}
    >
      <button
        type="button"
        className={`flex-1 min-w-0 flex items-center gap-3 py-3 pl-4 text-left focus:outline-none cursor-pointer ${
          onEdit || onDelete || menuItems.length > 0 ? 'pr-2' : 'pr-4'
        }`}
        onClick={onClick}
      >
        {/* Icon */}
        {icon && (
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg ${iconColor} flex items-center justify-center`}
          >
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-dark-900 dark:text-dark-50 truncate">
            {title}
          </h3>
          {(subtitle || metadata) && (
            <div className="flex items-center gap-2 mt-0.5">
              {subtitle && (
                <span className="text-xs text-dark-500 dark:text-dark-400 truncate">
                  {subtitle}
                </span>
              )}
              {subtitle && metadata && <span className="text-dark-300 dark:text-dark-600">•</span>}
              {metadata && (
                <span className="text-xs text-dark-500 dark:text-dark-400">{metadata}</span>
              )}
            </div>
          )}
        </div>

        {/* Badge */}
        {badge && (
          <div className="flex-shrink-0">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
        <div className="pr-4 py-3 flex-shrink-0">
          <ItemMenuDropdown onEdit={onEdit} onDelete={onDelete} menuItems={menuItems} />
        </div>
      )}
    </div>
  )
}
