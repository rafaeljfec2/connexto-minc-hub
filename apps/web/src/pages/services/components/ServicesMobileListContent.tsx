import type { Service } from '@minc-hub/shared/types'
import { ServiceListItem } from './ServiceListItem'

interface ServicesMobileListContentProps {
  readonly services: Service[]
  readonly isLoading: boolean
  readonly hasFilters: boolean
  readonly onServiceEdit: (service: Service) => void
  readonly onServiceDelete: (service: Service) => void
}

export function ServicesMobileListContent({
  services,
  isLoading,
  hasFilters,
  onServiceEdit,
  onServiceDelete,
}: ServicesMobileListContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-dark-500 dark:text-dark-400">
          {hasFilters ? 'Nenhum culto encontrado' : 'Nenhum culto cadastrado'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-900 rounded-lg overflow-hidden border border-dark-200 dark:border-dark-800">
      {services.map(service => (
        <ServiceListItem
          key={service.id}
          service={service}
          onEdit={onServiceEdit}
          onDelete={onServiceDelete}
        />
      ))}
    </div>
  )
}
