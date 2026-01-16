import { useMemo } from 'react'
import { XCircle, Info, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { ComboBoxOption } from '@/components/ui/ComboBox'
import type { ParsedRow } from '@/utils/spreadsheet-parser'
import type { Team } from '@minc-hub/shared/types'
import { MinistrySelector } from './MinistrySelector'
import { StatisticsHeader } from './StatisticsHeader'
import { PreviewTable } from './PreviewTable'

interface PeopleImportPreviewStepProps {
  parsedData: ParsedRow[]
  teamMapping: Map<number, string | null>
  teams: Team[]
  selectedMinistryId: string | null
  onMinistryChange: (value: string | null) => void
  onTeamChange: (rowNumber: number, teamId: string) => void
  onImport: () => void
  onRetry: () => void
  isLoadingMinistries: boolean
  ministryOptions: ComboBoxOption<string>[]
  isImporting: boolean
  currentImportProgress: number
  statistics: {
    totalRows: number
    totalValidRows: number
    totalInvalidRows: number
    hasErrors: boolean
  }
}

export function PeopleImportPreviewStep({
  parsedData,
  teamMapping,
  teams,
  selectedMinistryId,
  onMinistryChange,
  onTeamChange,
  onImport,
  onRetry,
  isLoadingMinistries,
  ministryOptions,
  isImporting,
  currentImportProgress,
  statistics,
}: Readonly<PeopleImportPreviewStepProps>) {
  const teamOptions = useMemo(() => {
    return teams.map(team => ({ value: team.id, label: team.name }))
  }, [teams])

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Seleção de Time */}
      <div className="mb-4 pb-4 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
        <MinistrySelector
          options={ministryOptions}
          value={selectedMinistryId}
          onValueChange={onMinistryChange}
          isLoading={isLoadingMinistries}
          hasData={parsedData.length > 0}
        />
      </div>

      {/* Header com estatísticas */}
      <StatisticsHeader
        totalRows={statistics.totalRows}
        totalValidRows={statistics.totalValidRows}
        totalInvalidRows={statistics.totalInvalidRows}
      />

      {/* Mensagens de erro/info */}
      <div className="mb-4 flex-shrink-0">
        {statistics.hasErrors && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-3 rounded-lg flex items-center gap-2">
            <XCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              Foram encontrados erros em algumas linhas. Apenas as linhas válidas serão importadas.
            </p>
          </div>
        )}
        {!statistics.hasErrors && parsedData.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 p-3 rounded-lg flex items-center gap-2">
            <Info className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">Nenhum dado válido encontrado na planilha.</p>
          </div>
        )}
      </div>

      {/* Tabela de preview */}
      {parsedData.length > 0 && (
        <PreviewTable
          parsedData={parsedData}
          teamMapping={teamMapping}
          teams={teams}
          teamOptions={teamOptions}
          onTeamChange={onTeamChange}
        />
      )}

      {/* Footer fixo */}
      <div className="mt-auto pt-4 border-t border-dark-200 dark:border-dark-800 flex justify-end gap-3 flex-shrink-0">
        <Button variant="secondary" onClick={onRetry} disabled={isImporting}>
          Voltar
        </Button>
        <Button
          variant="primary"
          onClick={onImport}
          isLoading={isImporting}
          disabled={
            isImporting ||
            parsedData.length === 0 ||
            statistics.totalValidRows === 0 ||
            !selectedMinistryId
          }
        >
          <Upload className="h-4 w-4 mr-2" />
          {isImporting
            ? `Importando (${currentImportProgress}%)`
            : `Importar ${statistics.totalValidRows} Voluntários`}
        </Button>
      </div>
    </div>
  )
}
