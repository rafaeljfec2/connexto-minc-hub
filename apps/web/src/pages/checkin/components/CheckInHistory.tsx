import { Card } from '@/components/ui/Card'
import type { Attendance } from '@minc-hub/shared/types'

interface CheckInHistoryProps {
  history: Attendance[]
  compact?: boolean // To control how many items to show (e.g. 5 for mobile/compact view)
  title?: string
}

export function CheckInHistory({
  history,
  compact = false,
  title = 'Histórico Recente',
}: CheckInHistoryProps) {
  if (history.length === 0) return null

  const displayHistory = compact ? history.slice(0, 5) : history

  return (
    <Card className={compact ? 'p-4' : 'p-6 lg:col-span-2'}>
      <h3 className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-4">{title}</h3>
      <div className="space-y-2">
        {displayHistory.map(attendance => (
          <div
            key={attendance.id}
            className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-900 rounded-lg"
          >
            <div>
              <p className="text-sm font-medium text-dark-900 dark:text-dark-50">
                {new Date(attendance.checkedInAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs text-dark-600 dark:text-dark-400">
                {new Date(attendance.checkedInAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <p className="text-xs font-medium text-green-700 dark:text-green-400">Presente</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
