import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Schedule } from '@/types'
import { formatDate } from '@/lib/utils'
import { EditIcon, TrashIcon } from '@/components/icons'

interface ScheduleCardProps {
  readonly schedule: Schedule
  readonly serviceName?: string
  readonly ministryName?: string | null
  readonly teamNames?: string
  readonly onEdit: (schedule: Schedule) => void
  readonly onDelete: (id: string) => void
  readonly isUpdating: boolean
  readonly isDeleting: boolean
}

export function ScheduleCard({
  schedule,
  serviceName,
  ministryName,
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
            <div className="space-y-2 text-sm">
              <p className="text-dark-600 dark:text-dark-400">
                <span className="font-semibold text-dark-700 dark:text-dark-200">Data:</span>{' '}
                {formatDate(schedule.date)}
              </p>
              {ministryName && (
                <div>
                  <span className="text-xs font-medium text-dark-600 dark:text-dark-400 mb-1.5 block">
                    Time:
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                    {ministryName}
                  </span>
                </div>
              )}
              {teamNames && (
                <div>
                  <span className="text-xs font-medium text-dark-600 dark:text-dark-400 mb-1.5 block">
                    Equipes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {teamNames.split(', ').map((teamName, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      >
                        {teamName}
                      </span>
                    ))}
                  </div>
                </div>
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
