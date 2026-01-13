import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { Button } from '@/components/ui/Button'
import { TableRow, TableCell } from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'
import { SortableColumn } from '@/components/ui/SortableColumn'
import { UserIcon, EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { formatDate } from '@minc-hub/shared/utils'
import { cn } from '@/lib/utils'
import { Person, Ministry, Team, MemberType } from '@minc-hub/shared/types'
import { ServoCard } from './ServoCard'
import { ViewMode } from '@/hooks/useViewMode'
import { SortConfig } from '@/hooks/useSort'

interface PeopleDesktopViewProps {
  readonly people: Person[]
  readonly ministries: Ministry[]
  readonly teams: Team[]
  readonly getMinistry: (id?: string) => Ministry | undefined
  readonly getTeam: (id?: string) => Team | undefined
  readonly hasUser: (personId: string) => boolean
  readonly searchTerm: string
  readonly filterMinistry: string
  readonly filterTeam: string
  readonly viewMode: ViewMode
  readonly sortConfig: SortConfig<Person>
  readonly isLoading: boolean
  readonly onSearchChange: (value: string) => void
  readonly onFilterMinistryChange: (value: string) => void
  readonly onFilterTeamChange: (value: string) => void
  readonly onViewModeChange: (mode: ViewMode) => void
  readonly onSort: (key: keyof Person) => void
  readonly onEdit: (person: Person) => void
  readonly onDelete: (id: string) => void
  readonly onCreateUser: (person: Person) => void
  readonly onCreateClick: () => void
}

function PersonCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-200 dark:border-dark-700 p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  )
}

function PersonRowSkeleton() {
  return (
    <>
      <TableCell>
        <Skeleton className="h-5 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </TableCell>
    </>
  )
}

export function PeopleDesktopView({
  people,
  ministries,
  teams,
  getMinistry,
  getTeam,
  hasUser,
  searchTerm,
  filterMinistry,
  filterTeam,
  viewMode,
  sortConfig,
  isLoading,
  onSearchChange,
  onFilterMinistryChange,
  onFilterTeamChange,
  onViewModeChange,
  onSort,
  onEdit,
  onDelete,
  onCreateUser,
  onCreateClick,
}: PeopleDesktopViewProps) {
  const hasFilters = searchTerm !== '' || filterMinistry !== 'all' || filterTeam !== 'all'

  // Filter ministries by isActive for the filter dropdown
  const filteredMinistries = ministries.filter(m => m.isActive)

  // Available teams for filter
  const availableTeams =
    filterMinistry === 'all'
      ? teams.filter(t => t.isActive)
      : teams.filter(t => t.ministryId === filterMinistry && t.isActive)

  const renderHeader = (key: string, label: string) => (
    <SortableColumn
      key={key}
      sortKey={key}
      currentSort={sortConfig}
      onSort={k => onSort(k as keyof Person)}
    >
      {label}
    </SortableColumn>
  )

  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {people.map(person => (
        <ServoCard
          key={person.id}
          person={person}
          ministry={getMinistry(person.ministryId)}
          team={getTeam(person.teamId)}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreateUser={onCreateUser}
          hasUser={hasUser(person.id)}
          isUpdating={isLoading}
          isDeleting={isLoading}
        />
      ))}
    </div>
  )

  const listViewRows = people.map(person => {
    // Compute team display to avoid nested ternary
    let teamDisplay: React.ReactNode
    if (person.teamMembers && person.teamMembers.length > 0) {
      teamDisplay = (
        <div className="flex flex-wrap gap-1">
          {person.teamMembers.map(teamMember => {
            const team = teams.find(t => t.id === teamMember.teamId)
            const isFixed = teamMember.memberType === MemberType.FIXED
            return (
              <span
                key={teamMember.id}
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  isFixed
                    ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                    : 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                )}
                title={isFixed ? 'Membro fixo' : 'Ajuda eventual'}
              >
                {team?.name ?? 'Equipe desconhecida'}
                {!isFixed && <span className="ml-1 text-[10px] opacity-75">(E)</span>}
              </span>
            )
          })}
        </div>
      )
    } else {
      const legacyTeam = getTeam(person.teamId)
      teamDisplay = legacyTeam ? <span className="text-sm">{legacyTeam.name}</span> : '-'
    }

    return (
      <TableRow key={person.id}>
        <TableCell>
          <span className="font-medium">{person.name}</span>
        </TableCell>
        <TableCell>{person.email ?? '-'}</TableCell>
        <TableCell>{person.phone ?? '-'}</TableCell>
        <TableCell>{getMinistry(person.ministryId)?.name ?? '-'}</TableCell>
        <TableCell>{teamDisplay}</TableCell>
        <TableCell>{person.birthDate ? formatDate(person.birthDate) : '-'}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="action-edit" size="sm" onClick={() => onEdit(person)} title="Editar">
              <EditIcon className="h-4 w-4" />
            </Button>
            {!hasUser(person.id) && onCreateUser && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onCreateUser(person)}
                title="Criar usuário para este servo"
              >
                <UserIcon className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="action-delete"
              size="sm"
              onClick={() => onDelete(person.id)}
              title="Excluir"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  })

  return (
    <div className="hidden lg:block">
      <CrudPageLayout
        title="Servos"
        description="Gerencie servos do Time Boas-Vindas"
        icon={<UserIcon className="h-8 w-8 text-primary-400" />}
        createButtonLabel="Adicionar Volutário"
        onCreateClick={onCreateClick}
        hasFilters={hasFilters}
        isEmpty={people.length === 0}
        isLoading={isLoading}
        emptyTitle={hasFilters ? 'Nenhum servo encontrado' : 'Nenhum servo cadastrado'}
        emptyDescription={
          hasFilters
            ? 'Tente ajustar os filtros para encontrar servos'
            : 'Comece adicionando um novo servo'
        }
        createButtonIcon={<PlusIcon className="h-5 w-5 mr-2" />}
        filters={
          <CrudFilters
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Buscar por nome, email ou telefone..."
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            filters={[
              {
                value: filterMinistry,
                onChange: onFilterMinistryChange,
                options: [
                  { value: 'all', label: 'Todos os times' },
                  ...filteredMinistries.map(m => ({ value: m.id, label: m.name })),
                ],
              },
              {
                value: filterTeam,
                onChange: onFilterTeamChange,
                disabled: filterMinistry === 'all',
                options: [
                  { value: 'all', label: 'Todas as equipes' },
                  ...availableTeams.map(t => ({
                    value: t.id,
                    label: t.name,
                  })),
                ],
              },
            ]}
          />
        }
        content={
          <CrudView
            viewMode={viewMode}
            isLoading={isLoading}
            skeletonCard={<PersonCardSkeleton />}
            skeletonRow={<PersonRowSkeleton />}
            gridView={gridView}
            listView={{
              headers: [
                renderHeader('name', 'Nome'),
                renderHeader('email', 'Email'),
                renderHeader('phone', 'Telefone'),
                renderHeader('ministry', 'Time'),
                renderHeader('team', 'Equipe'),
                renderHeader('birthday', 'Data de Nascimento'),
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
