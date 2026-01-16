import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { ImportResult } from '../hooks/usePeopleImport'
import type { ParsedRow } from '@/utils/spreadsheet-parser'

interface PeopleImportResultsStepProps {
  results: ImportResult[]
  parsedData: ParsedRow[]
  onClose: () => void
  onRetry: () => void
}

export function PeopleImportResultsStep({
  results,
  parsedData,
  onClose,
  onRetry,
}: Readonly<PeopleImportResultsStepProps>) {
  const successfulImports = results.filter(r => r.success).length
  const failedImports = results.filter(r => !r.success).length

  return (
    <div>
      <h3 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-4">
        Resultados da Importação
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-800 dark:text-green-200">
            {successfulImports}
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">Importados com Sucesso</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
          <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-800 dark:text-red-200">{failedImports}</p>
          <p className="text-sm text-red-700 dark:text-red-300">Falhas na Importação</p>
        </div>
      </div>

      {failedImports > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2">
            Detalhes dos Erros
          </h4>
          <div className="overflow-x-auto rounded-lg border border-dark-200 dark:border-dark-700">
            <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
              <thead className="bg-dark-50 dark:bg-dark-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                    Linha
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                    Erro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-900 divide-y divide-dark-200 dark:divide-dark-700">
                {results
                  .filter(r => !r.success)
                  .map(result => {
                    const originalRow = parsedData.find(row => row.rowNumber === result.rowNumber)
                    return (
                      <tr
                        key={result.rowNumber}
                        className="hover:bg-dark-50 dark:hover:bg-dark-800"
                      >
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-dark-900 dark:text-dark-50">
                          {result.rowNumber}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-dark-700 dark:text-dark-300">
                          {originalRow?.nome || '-'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                          {result.error}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
        <Button variant="primary" onClick={onRetry}>
          Importar Outra Planilha
        </Button>
      </div>
    </div>
  )
}
