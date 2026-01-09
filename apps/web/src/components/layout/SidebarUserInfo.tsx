import { User } from '@minc-hub/shared/types'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/Avatar'

interface SidebarUserInfoProps {
  readonly user: User
}

export function SidebarUserInfo({ user }: SidebarUserInfoProps) {
  const { logout } = useAuth()

  return (
    <div className="p-4 border-t border-dark-200 dark:border-dark-800 flex items-center justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar src={user.avatar} name={user.name} size="sm" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
            {user.name}
          </span>
          <span className="text-xs text-dark-500 dark:text-dark-400 truncate">
            {user.email || 'Usuário'}
          </span>
        </div>
      </div>
      <button
        onClick={logout}
        className="p-2 text-dark-500 hover:text-red-600 dark:text-dark-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
        title="Sair"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </div>
  )
}
