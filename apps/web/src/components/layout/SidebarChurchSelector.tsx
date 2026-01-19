import { useMemo } from 'react'
import { ComboBox, ComboBoxOption } from '@/components/ui/ComboBox'
import { useChurch } from '@/contexts/ChurchContext'
import { useChurchesQuery } from '@/hooks/queries/useChurchesQuery'

export function SidebarChurchSelector() {
  const { selectedChurch, setSelectedChurch } = useChurch()
  const { churches, isLoading } = useChurchesQuery()

  const placeholderText = useMemo(() => {
    if (isLoading) return 'Carregando...'
    if (churches.length === 0) return 'Nenhuma igreja'
    return 'Selecione uma igreja'
  }, [isLoading, churches.length])

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
          <span className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">{church.address}</span>
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
          <span className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">{church.address}</span>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 border-b border-dark-200 dark:border-dark-800">
      <ComboBox
        options={churchOptions}
        value={selectedChurch?.id || null}
        onValueChange={handleChurchChange}
        placeholder={placeholderText}
        searchable
        searchPlaceholder="Buscar igreja..."
        renderItem={renderChurchItem}
        renderTrigger={renderChurchTrigger}
        maxHeight="max-h-56"
        className="w-full h-[52px] px-4 bg-white dark:bg-dark-900 border border-dark-300 dark:border-dark-700 rounded-md shadow-sm"
        contentClassName="rounded-md shadow-lg"
      />
    </div>
  )
}
