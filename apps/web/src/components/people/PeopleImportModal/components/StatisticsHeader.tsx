import { CheckCircle2, XCircle } from 'lucide-react'

interface StatisticsHeaderProps {
  totalRows: number
  totalValidRows: number
  totalInvalidRows: number
}

export function StatisticsHeader({
  totalRows,
  totalValidRows,
  totalInvalidRows,
}: Readonly<StatisticsHeaderProps>) {
  return (
    <div className="mb-4 pb-4 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
      <h3 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-3">
        Pré-visualização dos Dados
      </h3>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-dark-600 dark:text-dark-400">Total:</span>
          <span className="font-semibold text-dark-900 dark:text-dark-50">{totalRows}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-dark-600 dark:text-dark-400">Válidos:</span>
          <span className="font-semibold text-green-700 dark:text-green-400">{totalValidRows}</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-dark-600 dark:text-dark-400">Inválidos:</span>
          <span className="font-semibold text-red-700 dark:text-red-400">{totalInvalidRows}</span>
        </div>
      </div>
    </div>
  )
}
