import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Service } from '@/types'
import { formatTime } from '@/lib/utils'
import { getDayLabel, getServiceTypeLabel } from '@/lib/constants'
import { EditIcon, TrashIcon } from '@/components/icons'

interface ServiceCardProps {
  readonly service: Service
  readonly onEdit: (service: Service) => void
  readonly onDelete: (id: string) => void
  readonly isUpdating: boolean
  readonly isDeleting: boolean
}

export function ServiceCard({
  service,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}: ServiceCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2 truncate">
              {service.name}
            </h3>
            <div className="space-y-1 text-sm text-dark-600 dark:text-dark-400">
              <p>
                <span className="font-semibold text-dark-700 dark:text-dark-200">Tipo:</span>{' '}
                {getServiceTypeLabel(service.type)}
              </p>
              <p>
                <span className="font-semibold text-dark-700 dark:text-dark-200">Dia:</span>{' '}
                {getDayLabel(service.dayOfWeek)}
              </p>
              <p>
                <span className="font-semibold text-dark-700 dark:text-dark-200">Horário:</span>{' '}
                {formatTime(service.time)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <StatusBadge status={service.isActive ? 'active' : 'inactive'}>
            {service.isActive ? 'Ativo' : 'Inativo'}
          </StatusBadge>
        </div>

        <div className="flex gap-2 pt-4 border-t border-dark-200 dark:border-dark-800">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(service)}
            disabled={isUpdating}
            className="flex-1"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(service.id)}
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
