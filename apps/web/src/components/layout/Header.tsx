import { HeaderProfile } from './HeaderProfile'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { BrandText } from '@/components/ui/BrandText'
import { ComboBox, ComboBoxOption } from '@/components/ui/ComboBox'
import { useChurch } from '@/contexts/ChurchContext'
import { useChurches } from '@/hooks/useChurches'
import { useMemo } from 'react'

const HEADER_CLASSES = {
  container:
    'sticky top-0 z-30 w-full border-b border-dark-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-dark-800 dark:bg-dark-950/95 dark:supports-[backdrop-filter]:dark:bg-dark-950/80 transition-all duration-300 animate-fade-in-down',
  content: 'lg:ml-64',
  inner: 'w-full flex h-16 items-center justify-between',
  logo: 'hidden lg:flex items-center gap-2 -ml-56 transition-transform duration-300 hover:scale-105',
  profile: 'flex items-center justify-end gap-3 pr-4 sm:pr-6 lg:pr-8 relative z-50',
}

export function Header() {
  const { selectedChurch, setSelectedChurch } = useChurch()
  const { churches } = useChurches()

  // Convert churches to ComboBox options
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

  // Custom render for church items (name + address in two lines)
  const renderChurchItem = (option: ComboBoxOption<string>) => {
    const church = churches.find(c => c.id === option.value)
    if (!church) return <span>{option.label}</span>

    return (
      <div className="flex flex-col">
        <span className="font-medium leading-tight text-sm">{church.name}</span>
        {church.address && (
          <span className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">
            {church.address}
          </span>
        )}
      </div>
    )
  }

  // Custom render for trigger (name + address in two lines)
  const renderChurchTrigger = (
    option: ComboBoxOption<string> | undefined,
    displayValue: string
  ) => {
    if (!option) {
      return (
        <div className="flex flex-col items-start flex-1">
          <span className="font-bold text-dark-900 dark:text-dark-50 leading-tight text-sm">
            {displayValue}
          </span>
        </div>
      )
    }

    const church = churches.find(c => c.id === option.value)
    if (!church) {
      return (
        <div className="flex flex-col items-start flex-1">
          <span className="font-bold text-dark-900 dark:text-dark-50 leading-tight text-sm">
            {displayValue}
          </span>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-start flex-1">
        <span className="font-bold text-dark-900 dark:text-dark-50 leading-tight text-sm">
          {church.name}
        </span>
        {church.address && (
          <span className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">
            {church.address}
          </span>
        )}
      </div>
    )
  }

  return (
    <header className={HEADER_CLASSES.container}>
      <div className={HEADER_CLASSES.content}>
        <div className={HEADER_CLASSES.inner}>
          <div className={HEADER_CLASSES.logo}>
            <BrandText size="sm" />
          </div>
          <div className={HEADER_CLASSES.profile}>
            {churches.length > 0 && (
              <div className="min-w-[242px]">
                <ComboBox
                  options={churchOptions}
                  value={selectedChurch?.id || null}
                  onValueChange={handleChurchChange}
                  placeholder="Selecione uma igreja"
                  searchable
                  searchPlaceholder="Buscar igreja..."
                  renderItem={renderChurchItem}
                  renderTrigger={renderChurchTrigger}
                  maxHeight="max-h-56"
                  className="h-[52px] px-4 bg-white dark:bg-dark-900 border border-dark-300 dark:border-dark-700 rounded-md shadow-sm"
                  contentClassName="rounded-md shadow-lg"
                />
              </div>
            )}
            <ThemeToggle />
            <HeaderProfile />
          </div>
        </div>
      </div>
    </header>
  )
}
