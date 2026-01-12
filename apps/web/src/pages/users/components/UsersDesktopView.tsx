import { Button } from '@/components/ui/Button'
import { TableRow, TableCell } from '@/components/ui/Table'
import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { User } from '@minc-hub/shared/types'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { SortableColumn } from '@/components/ui/SortableColumn'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getRoleLabel } from '@/lib/userUtils'
import { UserCard } from './UserCard'

interface UsersDesktopViewProps {
  readonly users: User[]
  readonly searchTerm: string
  readonly viewMode: 'list' | 'grid'
  readonly sortConfig: { key: string; direction: 'asc' | 'desc' } | null
  readonly isLoading: boolean
  readonly getPersonName: (personId?: string) => string
  readonly onSearchChange: (value: string) => void
  readonly onViewModeChange: (mode: 'list' | 'grid') => void
  readonly onSort: (key: string) => void
  readonly onEdit: (user: User) => void
  readonly onDelete: (id: string) => void
  readonly onCreateClick: () => void
}

export function UsersDesktopView({
  users,
  searchTerm,
  viewMode,
  sortConfig,
  isLoading,
  getPersonName,
  onSearchChange,
  onViewModeChange,
  onSort,
  onEdit,
  onDelete,
  onCreateClick,
}: UsersDesktopViewProps) {
  const hasFilters = searchTerm !== ''

  const renderHeader = (key: string, label: string) => (
    <SortableColumn
      key={key}
      sortKey={key}
      currentSort={sortConfig || { key: null, direction: 'asc' }}
      onSort={k => onSort(k)}
    >
      {label}
    </SortableColumn>
  )

  const gridView = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
          isUpdating={isLoading}
          isDeleting={isLoading}
        />
      ))}
    </div>
  )

  const listViewRows = users.map(user => (
    <TableRow key={user.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name
                .split(' ')
                .filter((_, i) => i < 2)
                .map(part => part[0])
                .join('')
                .toUpperCase()
            )}
          </div>
          <span className="font-medium">{user.name}</span>
        </div>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <span className="text-sm">{getRoleLabel(user.role)}</span>
      </TableCell>
      <TableCell>
        {user.personId ? (
          <StatusBadge status="active">{getPersonName(user.personId)}</StatusBadge>
        ) : (
          <span className="text-sm text-dark-400 dark:text-dark-500">Não vinculado</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="action-edit" size="sm" onClick={() => onEdit(user)}>
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button variant="action-delete" size="sm" onClick={() => onDelete(user.id)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))

  return (
    <CrudPageLayout
      title="Usuários"
      description="Gerencie usuários do sistema e suas permissões"
      createButtonLabel="Novo Usuário"
      onCreateClick={onCreateClick}
      hasFilters={hasFilters}
      isEmpty={users.length === 0}
      emptyTitle={hasFilters ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
      emptyDescription={
        hasFilters
          ? 'Tente ajustar os filtros para encontrar usuários'
          : 'Comece adicionando um novo usuário'
      }
      createButtonIcon={<PlusIcon className="h-5 w-5 mr-2" />}
      filters={
        <CrudFilters
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por nome, email ou papel..."
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
              renderHeader('email', 'Email'),
              renderHeader('role', 'Função'),
              renderHeader('person', 'Pessoa Vinculada'),
              'Ações',
            ],
            rows: listViewRows,
          }}
        />
      }
    />
  )
}
