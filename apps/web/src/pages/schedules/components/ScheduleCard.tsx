import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Schedule } from '@/types'
import { formatDate } from '@/lib/utils'
import { EditIcon, TrashIcon } from '@/components/icons'

interface ScheduleCardProps {
  readonly schedule: Schedule
  readonly serviceName?: string
  readonly teamNames?: string
  readonly onEdit: (schedule: Schedule) => void
  readonly onDelete: (id: string) => void
  readonly isUpdating: boolean
  readonly isDeleting: boolean
}

export function ScheduleCard({
  schedule,
  serviceName,
  teamNames,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}: ScheduleCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2 truncate">
              {serviceName ?? 'Culto não encontrado'}
            </h3>
            <div className="space-y-1 text-sm text-dark-600 dark:text-dark-400">
              <p>
                <span className="font-semibold text-dark-700 dark:text-dark-200">Data:</span>{' '}
                {formatDate(schedule.date)}
              </p>
              {teamNames && (
                <p>
                  <span className="font-semibold text-dark-700 dark:text-dark-200">Equipes:</span>{' '}
                  {teamNames}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-dark-200 dark:border-dark-800">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(schedule)}
            disabled={isUpdating}
            className="flex-1"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(schedule.id)}
            disabled={isDeleting}
            className="px-3"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
