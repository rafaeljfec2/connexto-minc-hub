import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ComboBox, type ComboBoxOption } from '@/components/ui/ComboBox'
import { useChurch } from '@/contexts/ChurchContext'
import { useChurches } from '@/hooks/useChurches'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

interface DashboardHeaderMobileProps {
  readonly onNotificationPress?: () => void
}

export function DashboardHeaderMobile({
  onNotificationPress,
}: Readonly<DashboardHeaderMobileProps>) {
  const { selectedChurch, setSelectedChurch } = useChurch()
  const { churches } = useChurches()
  const navigate = useNavigate()

  const churchOptions: ComboBoxOption<string>[] = useMemo(
    () =>
      churches.map(church => ({
        value: church.id,
        label: church.name,
      })),
    [churches]
  )

  const handleChurchChange = (churchId: string | null) => {
    if (!churchId) {
      setSelectedChurch(null)
      return
    }
    const selected = churches.find(church => church.id === churchId)
    setSelectedChurch(selected ?? null)
  }

  const handleMenuClick = () => {
    // Trigger the mobile menu button click from Sidebar
    const menuButton = document.querySelector(
      '[aria-label="Abrir menu"], [aria-label="Fechar menu"]'
    ) as HTMLElement
    if (menuButton) {
      menuButton.click()
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-30 w-full border-b border-dark-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-dark-800 dark:bg-dark-950/95 dark:supports-[backdrop-filter]:dark:bg-dark-950/80 transition-all duration-300 safe-area-top pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between px-4 py-3 gap-2">
        <button
          onClick={handleMenuClick}
          className="p-2 -ml-2 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50 transition-colors"
          aria-label="Abrir menu"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex flex-col flex-1 min-w-0"></div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="min-w-[120px] sm:min-w-[140px]">
            <ComboBox
              options={churchOptions}
              value={selectedChurch?.id || null}
              onValueChange={handleChurchChange}
              placeholder="Igreja"
              searchable
              searchPlaceholder="Buscar..."
              maxHeight="max-h-56"
              className="h-9 px-2 sm:px-3 text-xs sm:text-sm bg-white dark:bg-dark-900 border border-dark-300 dark:border-dark-700 rounded-md"
              contentClassName="rounded-md shadow-lg"
            />
          </div>
          <ThemeToggle />
          <button
            onClick={onNotificationPress}
            className="relative p-2 rounded-xl bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50 transition-colors"
            aria-label="Notificações"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-white dark:border-dark-900" />
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-xl bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50 transition-colors"
            aria-label="Perfil"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
