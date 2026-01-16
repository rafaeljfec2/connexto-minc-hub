import { Loader2 } from 'lucide-react'
import { ComboBox, type ComboBoxOption } from '@/components/ui/ComboBox'

interface MinistrySelectorProps {
  options: ComboBoxOption<string>[]
  value: string | null
  onValueChange: (value: string | null) => void
  isLoading: boolean
  hasData: boolean
}

export function MinistrySelector({
  options,
  value,
  onValueChange,
  isLoading,
  hasData,
}: Readonly<MinistrySelectorProps>) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Carregando times...</span>
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className="text-sm text-dark-600 dark:text-dark-400">
        Nenhum time disponível. Verifique se há times cadastrados para esta igreja.
      </div>
    )
  }

  return (
    <ComboBox
      options={options}
      value={value}
      onValueChange={onValueChange}
      label="Selecione o Time"
      placeholder="Selecione um time para associar os voluntários"
      searchable
      searchPlaceholder="Buscar time..."
      error={hasData && !value ? 'Selecione um time antes de importar' : undefined}
      disabled={isLoading}
    />
  )
}
