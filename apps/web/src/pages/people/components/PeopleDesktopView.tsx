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
  readonly onSendWhatsApp?: (person: Person) => void
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
  onSendWhatsApp,
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
          onSendWhatsApp={onSendWhatsApp}
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
            {onSendWhatsApp && person.phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSendWhatsApp(person)}
                title="Enviar código de acesso via WhatsApp"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </Button>
            )}
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
