import { ComboBox, type ComboBoxOption } from '@/components/ui/ComboBox'
import { useChurch } from '@/contexts/ChurchContext'
import { useChurches } from '@/hooks/useChurches'
import { useMemo } from 'react'

interface DashboardHeaderMobileProps {
  readonly onNotificationPress?: () => void
  readonly onBack?: () => void
  readonly title?: string
  readonly showChurchSelector?: boolean
}

export function DashboardHeaderMobile({
  onNotificationPress,
  onBack,
  title,
  showChurchSelector = true,
}: Readonly<DashboardHeaderMobileProps>) {
  const { selectedChurch, setSelectedChurch } = useChurch()
  const { churches } = useChurches()

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

  const renderHeaderContent = () => {
    if (title) {
      return (
        <h1 className="text-base font-semibold text-dark-900 dark:text-dark-50 truncate">
          {title}
        </h1>
      )
    }

    if (showChurchSelector) {
      return (
        <div className="w-full max-w-[200px]">
          <ComboBox
            options={churchOptions}
            value={selectedChurch?.id || null}
            onValueChange={handleChurchChange}
            placeholder="Igreja"
            searchable
            searchPlaceholder="Buscar..."
            maxHeight="max-h-56"
            className="h-9 px-0 sm:px-3 text-sm font-semibold justify-center bg-transparent border-none hover:bg-dark-100 dark:hover:bg-dark-800 focus:ring-0 text-dark-900 dark:text-dark-50"
            contentClassName="rounded-md shadow-lg"
            showEmptyMessage={false}
            renderTrigger={(_option, displayValue) => (
              <div className="flex items-center gap-1.5 mx-auto max-w-full">
                <span className="truncate">{displayValue}</span>
              </div>
            )}
          />
        </div>
      )
    }

    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-30 w-full border-b border-dark-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-dark-800 dark:bg-dark-950 transition-all duration-300 safe-area-top pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between px-2 py-1.5 gap-1.5">
        {onBack ? (
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50 transition-colors flex-shrink-0"
            aria-label="Voltar"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleMenuClick}
            className="p-2 -ml-2 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50 transition-colors flex-shrink-0"
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
        )}

        <div className="flex items-center justify-start flex-1 min-w-0 px-2">
          {renderHeaderContent()}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-xl text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
            aria-label="Atualizar página"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <button
            onClick={onNotificationPress}
            className="relative p-2 rounded-xl text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
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
        </div>
      </div>
    </div>
  )
}
