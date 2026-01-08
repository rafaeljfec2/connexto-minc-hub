import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/navigator/routes.constants'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@minc-hub/shared/types'
import { useChat } from '@/hooks/useChat'

interface TabItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  activeIcon: React.ReactNode
  roles?: UserRole[]
}

const TABS: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Início',
    href: ROUTES.DASHBOARD,
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    activeIcon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'schedules',
    label: 'Escalas',
    href: ROUTES.SCHEDULES,
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    activeIcon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    roles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE, UserRole.SERVO],
  },
  {
    id: 'checkin',
    label: 'Check-in',
    href: '/checkin',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2.01M19 8h2.01M12 12h.01M12 16h.01M12 20h.01M12 4h.01M12 8h.01M12 1v.01M12 23v.01"
        />
      </svg>
    ),
    activeIcon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h5v5H3V3zm11 0h5v5h-5V3zM3 16h5v5H3v-5zm11 0h5v5h-5v-5z" />
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'Chat',
    href: ROUTES.CHAT,
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    activeIcon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Perfil',
    href: ROUTES.PROFILE,
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    activeIcon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export function FooterMobile() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, hasAnyRole } = useAuth()
  const { unreadCount } = useChat()

  const visibleTabs = TABS.filter(tab => {
    if (!tab.roles) return true
    if (!user) return true // Show if logic uncertain, or maybe hidden? Assuming auth-ed here.
    const userRole = String(user.role).toLowerCase()
    if (userRole === 'admin') return true
    return hasAnyRole(tab.roles)
  })

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 w-full border-t border-dark-200 dark:border-dark-800 bg-white/95 dark:bg-dark-950 backdrop-blur supports-[backdrop-filter]:bg-white/80 safe-area-bottom pb-[env(safe-area-inset-bottom)] transition-all duration-300">
      <nav className="flex items-center justify-around px-2 py-2">
        {visibleTabs.map(tab => {
          const isActive = location.pathname === tab.href
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.href)}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 min-w-0 active:opacity-70 transition-opacity relative"
            >
              <div
                className={`${isActive ? 'text-primary-500' : 'text-dark-400 dark:text-dark-400'} relative`}
              >
                {isActive ? tab.activeIcon : tab.icon}
                {tab.id === 'chat' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-dark-950">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-medium ${isActive ? 'text-primary-500' : 'text-dark-400 dark:text-dark-400'}`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </footer>
  )
}
