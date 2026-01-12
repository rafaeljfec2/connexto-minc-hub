import type { ReactNode } from 'react'

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
  readonly onMenuClick?: () => void
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
  onMenuClick,
  className = '',
}: CompactListItemProps) {
  return (
    <button
      type="button"
      className={`w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors text-left ${className}`}
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
        <h3 className="text-sm font-semibold text-dark-900 dark:text-dark-50 truncate">{title}</h3>
        {(subtitle || metadata) && (
          <div className="flex items-center gap-2 mt-0.5">
            {subtitle && (
              <span className="text-xs text-dark-500 dark:text-dark-400 truncate">{subtitle}</span>
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

      {/* Menu Button */}
      {onMenuClick && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            onMenuClick()
          }}
          className="flex-shrink-0 p-1.5 text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      )}
    </button>
  )
}
