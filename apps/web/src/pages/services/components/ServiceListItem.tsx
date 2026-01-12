import type { Service } from '@minc-hub/shared/types'
import { CompactListItem } from '@/components/ui/CompactListItem'
import { formatTime } from '@minc-hub/shared/utils'
import { getDayLabel, getServiceTypeLabel } from '@/lib/constants'

interface ServiceListItemProps {
  readonly service: Service
  readonly onEdit?: (service: Service) => void
  readonly onDelete?: (service: Service) => void
  readonly onClick?: (service: Service) => void
}

export function ServiceListItem({ service, onEdit, onDelete, onClick }: ServiceListItemProps) {
  return (
    <CompactListItem
      icon={
        <svg
          className="w-5 h-5 text-primary-600 dark:text-primary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
      title={service.name}
      subtitle={getServiceTypeLabel(service.type)}
      metadata={`${getDayLabel(service.dayOfWeek)} • ${formatTime(service.time)}`}
      badge={
        service.isActive
          ? { text: 'Ativo', variant: 'success' }
          : { text: 'Inativo', variant: 'default' }
      }
      onClick={() => onClick?.(service)}
      onEdit={onEdit ? () => onEdit(service) : undefined}
      onDelete={onDelete ? () => onDelete(service) : undefined}
    />
  )
}
