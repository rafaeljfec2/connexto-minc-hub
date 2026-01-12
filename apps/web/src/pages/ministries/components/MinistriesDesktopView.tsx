import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { Button } from '@/components/ui/Button'
import { TableRow, TableCell } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SortableColumn } from '@/components/ui/SortableColumn'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { Ministry } from '@minc-hub/shared/types'
import { MinistryCard } from './MinistryCard'
import { ViewMode } from '@/hooks/useViewMode'
import { SortConfig } from '@/hooks/useSort'

interface MinistriesDesktopViewProps {
  readonly ministries: Ministry[]
  readonly getChurchName: (churchId: string) => string
  readonly searchTerm: string
  readonly viewMode: ViewMode
  readonly sortConfig: SortConfig<Ministry>
  readonly isLoading: boolean
  readonly onSearchChange: (value: string) => void
  readonly onViewModeChange: (mode: ViewMode) => void
  readonly onSort: (key: keyof Ministry) => void
  readonly onEdit: (ministry: Ministry) => void
  readonly onDelete: (id: string) => void
  readonly onCreateClick: () => void
}

export function MinistriesDesktopView({
  ministries,
  getChurchName,
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
}: MinistriesDesktopViewProps) {
  const hasFilters = searchTerm !== ''

  const renderHeader = (key: string, label: string) => (
    <SortableColumn
      key={key}
      sortKey={key}
      currentSort={sortConfig}
      onSort={k => onSort(k as keyof Ministry)}
    >
      {label}
    </SortableColumn>
  )

  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {ministries.map(ministry => (
        <MinistryCard
          key={ministry.id}
          ministry={ministry}
          churchName={getChurchName(ministry.churchId)}
          onEdit={onEdit}
          onDelete={onDelete}
          isUpdating={isLoading}
          isDeleting={isLoading}
        />
      ))}
    </div>
  )

  const listViewRows = ministries.map(ministry => (
    <TableRow key={ministry.id}>
      <TableCell>
        <span className="font-medium">{ministry.name}</span>
      </TableCell>
      <TableCell>{ministry.description ?? '-'}</TableCell>
      <TableCell>{getChurchName(ministry.churchId)}</TableCell>
      <TableCell>
        <StatusBadge status={ministry.isActive ? 'active' : 'inactive'}>
          {ministry.isActive ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="action-edit" size="sm" onClick={() => onEdit(ministry)}>
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button variant="action-delete" size="sm" onClick={() => onDelete(ministry.id)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))

  return (
    <div className="hidden lg:block">
      <CrudPageLayout
        title="Times"
        description="Gerencie os times (ministérios) da igreja"
        createButtonLabel="Novo Time"
        onCreateClick={onCreateClick}
        hasFilters={hasFilters}
        isEmpty={ministries.length === 0}
        emptyTitle={hasFilters ? 'Nenhum time encontrado' : 'Nenhum time cadastrado'}
        emptyDescription={
          hasFilters
            ? 'Tente ajustar os filtros para encontrar times'
            : 'Comece adicionando um novo time'
        }
        createButtonIcon={<PlusIcon className="h-5 w-5 mr-2" />}
        filters={
          <CrudFilters
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Buscar por nome ou descrição..."
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
                renderHeader('description', 'Descrição'),
                renderHeader('church', 'Igreja'),
                renderHeader('status', 'Status'),
                'Ações',
              ],
              rows: listViewRows,
            }}
          />
        }
      />
    </div>
  )
}
