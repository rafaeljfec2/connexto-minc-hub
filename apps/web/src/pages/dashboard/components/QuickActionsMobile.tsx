import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/navigator/routes.constants'

interface QuickActionsMobileProps {
  onActionPress?: (actionId: string) => void
}

export function QuickActionsMobile({ onActionPress }: QuickActionsMobileProps) {
  const navigate = useNavigate()

  const actions = [
    {
      id: 'check-in',
      label: 'Check-in',
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
      onPress: () => {
        onActionPress?.('check-in')
        navigate(ROUTES.CHECKIN)
      },
    },
    {
      id: 'schedules',
      label: 'Escalas',
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
      onPress: () => {
        onActionPress?.('schedules')
        navigate(ROUTES.SCHEDULES)
      },
    },
    {
      id: 'teams',
      label: 'Equipes',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      onPress: () => {
        onActionPress?.('teams')
        navigate(ROUTES.TEAMS)
      },
    },
    {
      id: 'chat',
      label: 'Chat',
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
      onPress: () => {
        onActionPress?.('chat')
        navigate(ROUTES.COMMUNICATION)
      },
    },
  ]

  return (
    <div className="mb-6">
      <h2 className="text-base font-semibold text-dark-900 dark:text-dark-50 mb-4 px-4">
        Acesso Rápido
      </h2>
      <div className="flex gap-6 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={action.onPress}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className="w-14 h-14 rounded-full bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 flex items-center justify-center text-dark-900 dark:text-dark-50 shadow-sm hover:shadow-md transition-shadow">
              {action.icon}
            </div>
            <span className="text-xs font-medium text-dark-900 dark:text-dark-50">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
