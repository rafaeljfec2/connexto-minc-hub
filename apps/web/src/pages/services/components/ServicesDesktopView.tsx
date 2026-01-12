import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { Button } from '@/components/ui/Button'
import { TableRow, TableCell } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SortableColumn } from '@/components/ui/SortableColumn'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { Service } from '@minc-hub/shared/types'
import { formatTime } from '@minc-hub/shared/utils'
import { getDayLabel, getServiceTypeLabel } from '@/lib/constants'
import { ServiceCard } from './ServiceCard'
import { ViewMode } from '@/hooks/useViewMode'
import { SortConfig } from '@/hooks/useSort'

interface ServicesDesktopViewProps {
  readonly services: Service[]
  readonly searchTerm: string
  readonly viewMode: ViewMode
  readonly sortConfig: SortConfig<Service>
  readonly isLoading: boolean
  readonly onSearchChange: (value: string) => void
  readonly onViewModeChange: (mode: ViewMode) => void
  readonly onSort: (key: keyof Service) => void
  readonly onEdit: (service: Service) => void
  readonly onDelete: (id: string) => void
  readonly onCreateClick: () => void
}

export function ServicesDesktopView({
  services,
  searchTerm,
  viewMode,
  sortConfig,
  isLoading,
  onSearchChange,
  onViewModeChange,
  onSort,
  onEdit,
  onDelete,
  onCreateClick,
}: ServicesDesktopViewProps) {
  const hasFilters = searchTerm !== ''

  const renderHeader = (key: string, label: string) => (
    <SortableColumn
      key={key}
      sortKey={key}
      currentSort={sortConfig}
      onSort={k => onSort(k as keyof Service)}
    >
      {label}
    </SortableColumn>
  )

  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map(service => (
        <ServiceCard
          key={service.id}
          service={service}
          onEdit={onEdit}
          onDelete={onDelete}
          isUpdating={isLoading}
          isDeleting={isLoading}
        />
      ))}
    </div>
  )

  const listViewRows = services.map(service => (
    <TableRow key={service.id}>
      <TableCell>
        <span className="font-medium">{service.name}</span>
      </TableCell>
      <TableCell>{getServiceTypeLabel(service.type)}</TableCell>
      <TableCell>{getDayLabel(service.dayOfWeek)}</TableCell>
      <TableCell>{formatTime(service.time)}</TableCell>
      <TableCell>
        <StatusBadge status={service.isActive ? 'active' : 'inactive'}>
          {service.isActive ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="action-edit" size="sm" onClick={() => onEdit(service)}>
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => onDelete(service.id)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))

  return (
    <CrudPageLayout
      title="Cultos e Serviços"
      description="Configure os cultos e horários da igreja"
      createButtonLabel="Novo Culto"
      onCreateClick={onCreateClick}
      hasFilters={hasFilters}
      isEmpty={services.length === 0}
      emptyTitle={hasFilters ? 'Nenhum culto encontrado' : 'Nenhum culto cadastrado'}
      emptyDescription={
        hasFilters
          ? 'Tente ajustar os filtros para encontrar cultos'
          : 'Comece adicionando um novo culto'
      }
      createButtonIcon={<PlusIcon className="h-5 w-5 mr-2" />}
      filters={
        <CrudFilters
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por nome..."
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      }
      content={
        <CrudView
          viewMode={viewMode}
          gridView={gridView}
          listView={{
            headers: [
              renderHeader('name', 'Nome'),
              renderHeader('type', 'Tipo'),
              renderHeader('day', 'Dia da Semana'),
              renderHeader('time', 'Horário'),
              renderHeader('status', 'Status'),
              'Ações',
            ],
            rows: listViewRows,
          }}
        />
      }
    />
  )
}
