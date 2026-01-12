import type { Team } from '@minc-hub/shared/types'

interface TeamListItemProps {
  readonly team: Team
  readonly ministryName: string
  readonly onMenuClick?: (team: Team) => void
  readonly onClick?: (team: Team) => void
}

export function TeamListItem({ team, ministryName, onMenuClick, onClick }: TeamListItemProps) {
  const memberCount = team.memberIds?.length ?? 0

  return (
    <button
      type="button"
      className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors text-left"
      onClick={() => onClick?.(team)}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-primary-600 dark:text-primary-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-dark-900 dark:text-dark-50 truncate">
          {team.name}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-dark-500 dark:text-dark-400 truncate">{ministryName}</span>
          {memberCount > 0 && (
            <>
              <span className="text-dark-300 dark:text-dark-600">•</span>
              <span className="text-xs text-dark-500 dark:text-dark-400">
                {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      {team.isActive && (
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
            Ativa
          </span>
        </div>
      )}

      {/* Menu Button */}
      {onMenuClick && (
        <button
          onClick={e => {
            e.stopPropagation()
            onMenuClick(team)
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
