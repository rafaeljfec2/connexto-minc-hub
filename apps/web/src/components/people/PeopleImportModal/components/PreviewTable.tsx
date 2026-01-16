import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ParsedRow } from '@/utils/spreadsheet-parser'
import type { Team } from '@minc-hub/shared/types'

interface PreviewTableProps {
  parsedData: ParsedRow[]
  teamMapping: Map<number, string | null>
  teams: Team[]
  teamOptions: Array<{ value: string; label: string }>
  onTeamChange: (rowNumber: number, teamId: string) => void
}

export function PreviewTable({
  parsedData,
  teamMapping,
  teams,
  teamOptions,
  onTeamChange,
}: Readonly<PreviewTableProps>) {
  return (
    <div className="flex-1 min-h-0 overflow-auto mb-4">
      <div className="overflow-x-auto rounded-lg border border-dark-200 dark:border-dark-700">
        <table className="w-full divide-y divide-dark-200 dark:divide-dark-700 table-fixed">
          <thead className="bg-dark-50 dark:bg-dark-800">
            <tr>
              <th className="w-12 px-2 py-1.5 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Linha
              </th>
              <th className="w-1/4 px-2 py-1.5 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Nome
              </th>
              <th className="w-24 px-2 py-1.5 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Telefone
              </th>
              <th className="w-20 px-2 py-1.5 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Equipe (Planilha)
              </th>
              <th className="w-1/3 px-2 py-1.5 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Equipe (Sistema)
              </th>
              <th className="w-20 px-2 py-1.5 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-900 divide-y divide-dark-200 dark:divide-dark-700">
            {parsedData.map(row => {
              const isValid = row.errors.length === 0
              const mappedTeamId = teamMapping.get(row.rowNumber)
              const mappedTeam = mappedTeamId ? teams.find(t => t.id === mappedTeamId) : null

              return (
                <tr
                  key={row.rowNumber}
                  className={cn(
                    isValid ? 'bg-white dark:bg-dark-900' : 'bg-red-50 dark:bg-red-900/10'
                  )}
                >
                  <td className="px-2 py-1.5 text-xs font-medium text-dark-900 dark:text-dark-50">
                    {row.rowNumber}
                  </td>
                  <td
                    className="px-2 py-1.5 text-xs text-dark-700 dark:text-dark-300 truncate"
                    title={row.nome}
                  >
                    {row.nome}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-dark-700 dark:text-dark-300">
                    {row.telefone}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-dark-700 dark:text-dark-300 text-center">
                    {row.equipe || '-'}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-dark-700 dark:text-dark-300">
                    <div className="flex items-center gap-1.5">
                      {mappedTeam && (
                        <span className="px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded text-xs font-medium truncate max-w-[100px]">
                          {mappedTeam.name}
                        </span>
                      )}
                      <select
                        value={mappedTeamId || ''}
                        onChange={e => onTeamChange(row.rowNumber, e.target.value)}
                        className={cn(
                          'block flex-1 pl-2 pr-8 py-1 text-xs border-dark-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md',
                          'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 border dark:border-dark-700',
                          !isValid && 'opacity-50 cursor-not-allowed'
                        )}
                        disabled={!isValid}
                      >
                        <option value="">Nenhuma equipe</option>
                        {teamOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-xs">
                    {isValid === false ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        <XCircle className="h-3 w-3" />
                        <span className="truncate max-w-[60px]" title={row.errors.join(', ')}>
                          Erro
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Válido
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
