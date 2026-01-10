import { useState, useMemo, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { TableRow, TableCell } from '@/components/ui/Table'
import { useModal } from '@/hooks/useModal'
import { useViewMode } from '@/hooks/useViewMode'
import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { Person, UserRole, MemberType, TeamMember } from '@minc-hub/shared/types'
import { ServoCard } from './people/components/ServoCard'
import { CreateUserForm } from './people/components/CreateUserForm'
import { TeamMembersSelector } from './people/components/TeamMembersSelector'
import { UserIcon, EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { formatDate } from '@minc-hub/shared/utils'
import { usePeople } from '@/hooks/usePeople'
import { useMinistries } from '@/hooks/useMinistries'
import { useTeams } from '@/hooks/useTeams'
import { useUsers } from '@/hooks/useUsers'
import { useServices } from '@/hooks/useServices'
import { CheckboxList } from '@/components/ui/CheckboxList'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSort } from '@/hooks/useSort'
import { SortableColumn } from '@/components/ui/SortableColumn'

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

export default function PeoplePage() {
  const {
    people,
    isLoading: isLoadingPeople,
    createPerson,
    updatePerson,
    deletePerson,
  } = usePeople()
  const { ministries } = useMinistries()
  const { teams } = useTeams()

  // Debug: Log data to verify it's being loaded
  useEffect(() => {
    // console.log('PeoplePage - people:', people.length, people)
  }, [people, ministries, teams])
  const { users, createUser, isLoading: isLoadingUsers } = useUsers()
  const { services } = useServices()
  // Modals
  const personModal = useModal()
  const deleteModal = useModal()
  const createUserModal = useModal()

  // Person form state
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [personFormData, setPersonFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    notes: '',
    ministryId: '',
    teamId: '',
    teamMembers: [] as Array<{ teamId: string; memberType: MemberType }>,
    preferredServiceIds: [] as string[],
  })

  // User creation state
  const [creatingUserForPerson, setCreatingUserForPerson] = useState<Person | null>(null)
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    role: UserRole.SERVO,
  })

  // Filters and search
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMinistry, setFilterMinistry] = useState<string>('all')
  const [filterTeam, setFilterTeam] = useState<string>('all')
  const { viewMode, setViewMode } = useViewMode({
    storageKey: 'servos-view-mode',
    defaultMode: 'list',
  })

  const { sortConfig, handleSort, sortData } = useSort<Person>({
    defaultKey: 'name',
    defaultDirection: 'asc',
  })

  const availableTeams = useMemo(() => {
    if (filterMinistry === 'all') {
      return teams.filter(t => t.isActive)
    }
    return teams.filter(t => t.ministryId === filterMinistry && t.isActive)
  }, [filterMinistry, teams])

  const getMinistry = useCallback(
    (ministryId?: string) => {
      if (!ministryId) return undefined
      return ministries.find(m => m.id === ministryId)
    },
    [ministries]
  )

  const getTeam = useCallback(
    (teamId?: string) => {
      if (!teamId) return undefined
      return teams.find(t => t.id === teamId)
    },
    [teams]
  )

  // Filter ministries by selected church (already filtered in useMinistries)
  const filteredMinistries = useMemo(() => {
    return ministries.filter(m => m.isActive)
  }, [ministries])

  const filteredPeople = useMemo(() => {
    const result = people.filter(person => {
      const matchesSearch =
        searchTerm === '' ||
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.phone?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMinistry = filterMinistry === 'all' || person.ministryId === filterMinistry

      const matchesTeam = filterTeam === 'all' || person.teamId === filterTeam

      return matchesSearch && matchesMinistry && matchesTeam
    })

    return sortData(result, {
      name: item => item.name.toLowerCase(),
      email: item => (item.email || '').toLowerCase(),
      phone: item => (item.phone || '').toLowerCase(),
      ministry: item => (getMinistry(item.ministryId)?.name || '').toLowerCase(),
      team: item => (getTeam(item.teamId)?.name || '').toLowerCase(),
      birthday: item => (item.birthDate ? new Date(item.birthDate).getTime() : 0),
    })
  }, [people, searchTerm, filterMinistry, filterTeam, sortData, getMinistry, getTeam])

  const renderHeader = (key: string, label: string) => (
    <SortableColumn key={key} sortKey={key} currentSort={sortConfig} onSort={handleSort}>
      {label}
    </SortableColumn>
  )

  const activeServices = useMemo(() => {
    return services.filter(service => service.isActive)
  }, [services])

  function handleTogglePreferredService(serviceId: string) {
    setPersonFormData(prev => {
      const currentIds = prev.preferredServiceIds
      const newIds = currentIds.includes(serviceId)
        ? currentIds.filter(id => id !== serviceId)
        : [...currentIds, serviceId]
      return { ...prev, preferredServiceIds: newIds }
    })
  }

  const initialPersonFormData = {
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    notes: '',
    ministryId: '',
    teamId: '',
    teamMembers: [] as Array<{ teamId: string; memberType: MemberType }>,
    preferredServiceIds: [] as string[],
  }

  function handleOpenPersonModal(person?: Person) {
    if (person) {
      setEditingPerson(person)
      // Extract preferred service IDs from person (assuming it's stored in notes or a custom field)
      // For now, we'll initialize as empty array - this would need backend support
      const preferredServiceIds: string[] = []

      // Convert teamMembers to form format
      const teamMembers: Array<{ teamId: string; memberType: MemberType }> =
        person.teamMembers?.map((tm: TeamMember) => ({
          teamId: tm.teamId,
          memberType: tm.memberType,
        })) ?? []

      // If person has teamId but no teamMembers, add it as fixed for compatibility
      if (person.teamId && teamMembers.length === 0) {
        teamMembers.push({
          teamId: person.teamId,
          memberType: MemberType.FIXED,
        })
      }

      setPersonFormData({
        name: person.name,
        email: person.email ?? '',
        phone: person.phone ?? '',
        birthDate: person.birthDate ?? '',
        address: person.address ?? '',
        notes: person.notes ?? '',
        ministryId: person.ministryId ?? '',
        teamId: person.teamId ?? '',
        teamMembers,
        preferredServiceIds,
      })
    } else {
      setEditingPerson(null)
      setPersonFormData(initialPersonFormData)
    }
    personModal.open()
  }

  function handleClosePersonModal() {
    personModal.close()
    setEditingPerson(null)
    setPersonFormData(initialPersonFormData)
  }

  function handlePersonMinistryChange(ministryId: string) {
    setPersonFormData({
      ...personFormData,
      ministryId,
      teamId: '',
    })
  }

  function handleFilterMinistryChange(value: string) {
    setFilterMinistry(value)
    setFilterTeam('all')
  }

  async function handlePersonSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      // Remove preferredServiceIds from payload as backend doesn't support it yet
      const { preferredServiceIds: _, ...rawPersonData } = personFormData

      // Create payload with proper typing - use Record for flexible structure
      const personData: Record<string, unknown> = { ...rawPersonData }

      // Clean empty strings by removing them from the object
      if (!personData.ministryId) {
        delete personData.ministryId
      }
      if (!personData.teamId) {
        delete personData.teamId
      }

      // Set teamId to first fixed team member for compatibility (if exists)
      if (Array.isArray(personData.teamMembers) && personData.teamMembers.length > 0) {
        const teamMembers = personData.teamMembers as Array<{
          teamId: string
          memberType: MemberType
        }>
        const firstFixedTeam = teamMembers.find(tm => tm.memberType === MemberType.FIXED)
        if (firstFixedTeam) {
          personData.teamId = firstFixedTeam.teamId
        } else {
          // If no fixed team, use first team
          personData.teamId = teamMembers[0].teamId
        }
      }

      // Ensure teamId is cleaned if it's still empty string after logic
      if (!personData.teamId) {
        delete personData.teamId
      }

      // API accepts simplified teamMembers structure
      if (editingPerson) {
        await updatePerson(editingPerson.id, personData as unknown as Partial<Person>)
      } else {
        await createPerson(personData as unknown as Person)
      }
      handleClosePersonModal()
    } catch (error) {
      // Error already handled in the hook with toast
      console.error('Error submitting person form:', error)
    }
  }

  async function handleSavePersonAndCreateUser(e: React.FormEvent) {
    e.preventDefault()

    try {
      // Remove preferredServiceIds from payload as backend doesn't support it yet
      const { preferredServiceIds: _, ...rawPersonData } = personFormData

      // Create payload with proper typing - use Record for flexible structure
      const personData: Record<string, unknown> = { ...rawPersonData }

      // Clean empty strings by removing them from the object
      if (!personData.ministryId) {
        delete personData.ministryId
      }
      if (!personData.teamId) {
        delete personData.teamId
      }

      // Set teamId to first fixed team member for compatibility (if exists)
      if (Array.isArray(personData.teamMembers) && personData.teamMembers.length > 0) {
        const teamMembers = personData.teamMembers as Array<{
          teamId: string
          memberType: MemberType
        }>
        const firstFixedTeam = teamMembers.find(tm => tm.memberType === MemberType.FIXED)
        if (firstFixedTeam) {
          personData.teamId = firstFixedTeam.teamId
        } else {
          // If no fixed team, use first team
          personData.teamId = teamMembers[0].teamId
        }
      }

      // Ensure teamId is cleaned if it's still empty string after logic
      if (!personData.teamId) {
        delete personData.teamId
      }

      let savedPerson: Person | null = null

      // API accepts simplified teamMembers structure
      if (editingPerson) {
        savedPerson = await updatePerson(editingPerson.id, personData as unknown as Partial<Person>)
      } else {
        savedPerson = await createPerson(personData as unknown as Person)
      }

      handleClosePersonModal()

      if (savedPerson) {
        setTimeout(() => {
          handleOpenCreateUserModal(savedPerson)
        }, 200)
      }
    } catch (error) {
      // Error already handled in the hook with toast
      console.error('Error saving person and creating user:', error)
    }
  }

  function handleDeleteClick(id: string) {
    setDeletingId(id)
    deleteModal.open()
  }

  async function handleDeleteConfirm() {
    if (deletingId) {
      try {
        await deletePerson(deletingId)
        setDeletingId(null)
        deleteModal.close()
      } catch (error) {
        // Error already handled in the hook with toast
        console.error('Error deleting person:', error)
      }
    }
  }

  const initialUserFormData = {
    email: '',
    password: '',
    role: UserRole.SERVO,
  }

  function handleOpenCreateUserModal(person: Person) {
    setCreatingUserForPerson(person)
    setUserFormData({
      email: person.email ?? '',
      password: '',
      role: UserRole.SERVO,
    })
    createUserModal.open()
  }

  function handleCloseCreateUserModal() {
    createUserModal.close()
    setCreatingUserForPerson(null)
    setUserFormData(initialUserFormData)
  }

  async function handleCreateUserSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!creatingUserForPerson) return

    try {
      await createUser({
        name: creatingUserForPerson.name,
        email: userFormData.email,
        password: userFormData.password,
        role: userFormData.role,
        personId: creatingUserForPerson.id,
        canCheckIn: false,
      })

      handleCloseCreateUserModal()
    } catch (error) {
      // Error already handled in the hook with toast
      console.error('Error creating user for person:', error)
    }
  }

  function hasUser(personId: string): boolean {
    return users.some(user => user.personId === personId)
  }

  const hasFilters = searchTerm !== '' || filterMinistry !== 'all' || filterTeam !== 'all'

  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredPeople.map(person => (
        <ServoCard
          key={person.id}
          person={person}
          ministry={getMinistry(person.ministryId)}
          team={getTeam(person.teamId)}
          onEdit={handleOpenPersonModal}
          onDelete={handleDeleteClick}
          onCreateUser={handleOpenCreateUserModal}
          hasUser={hasUser(person.id)}
          isUpdating={isLoadingPeople}
          isDeleting={isLoadingPeople}
        />
      ))}
    </div>
  )

  const listViewRows = filteredPeople.map(person => {
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenPersonModal(person)}
              title="Editar"
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            {!hasUser(person.id) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenCreateUserModal(person)}
                title="Criar usuário para este servo"
              >
                <UserIcon className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(person.id)}
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
    <>
      <CrudPageLayout
        title="Servos"
        description="Gerencie servos do Time Boas-Vindas"
        icon={<UserIcon className="h-8 w-8 text-primary-400" />}
        createButtonLabel="Adicionar Servo"
        onCreateClick={() => handleOpenPersonModal()}
        hasFilters={hasFilters}
        isEmpty={filteredPeople.length === 0}
        isLoading={isLoadingPeople}
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
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nome, email ou telefone..."
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filters={[
              {
                value: filterMinistry,
                onChange: handleFilterMinistryChange,
                options: [
                  { value: 'all', label: 'Todos os times' },
                  ...filteredMinistries.map(m => ({ value: m.id, label: m.name })),
                ],
              },
              {
                value: filterTeam,
                onChange: setFilterTeam,
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
            isLoading={isLoadingPeople}
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

      <Modal
        isOpen={personModal.isOpen}
        onClose={handleClosePersonModal}
        title={editingPerson ? 'Editar Servo' : 'Novo Servo'}
        size="lg"
      >
        <form onSubmit={handlePersonSubmit} className="space-y-4">
          {/* Basic Information Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-dark-800 dark:text-dark-200 pb-2 border-b border-dark-200 dark:border-dark-700">
              Informações Básicas
            </h3>
            <Input
              label="Nome *"
              value={personFormData.name}
              onChange={e => setPersonFormData({ ...personFormData, name: e.target.value })}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email"
                type="email"
                value={personFormData.email}
                onChange={e => setPersonFormData({ ...personFormData, email: e.target.value })}
              />
              <Input
                label="Telefone"
                value={personFormData.phone}
                onChange={e => setPersonFormData({ ...personFormData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Data de Nascimento"
                type="date"
                value={personFormData.birthDate}
                onChange={e => setPersonFormData({ ...personFormData, birthDate: e.target.value })}
              />
              <Input
                label="Endereço"
                value={personFormData.address}
                onChange={e => setPersonFormData({ ...personFormData, address: e.target.value })}
              />
            </div>
          </div>

          {/* Ministry and Teams Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-dark-800 dark:text-dark-200 pb-2 border-b border-dark-200 dark:border-dark-700">
              Time e Equipes
            </h3>
            <Select
              label="Time"
              value={personFormData.ministryId}
              onChange={e => handlePersonMinistryChange(e.target.value)}
              options={[
                { value: '', label: 'Selecione um time' },
                ...filteredMinistries.map(m => ({ value: m.id, label: m.name })),
              ]}
            />
            <div className="bg-dark-50 dark:bg-dark-900/30 p-4 rounded-lg border border-dark-200 dark:border-dark-700">
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">
                Equipes
              </label>
              <TeamMembersSelector
                teams={teams}
                ministries={ministries}
                selectedMinistryId={personFormData.ministryId || undefined}
                value={personFormData.teamMembers}
                onChange={teamMembers => setPersonFormData({ ...personFormData, teamMembers })}
              />
            </div>
          </div>

          {/* Service Preferences Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-dark-800 dark:text-dark-200 pb-2 border-b border-dark-200 dark:border-dark-700">
              Preferências de Cultos
            </h3>
            <div className="space-y-2">
              <p className="text-xs text-dark-600 dark:text-dark-400">
                Selecione os cultos em que este servo prefere servir
              </p>
              {activeServices.length > 0 ? (
                <CheckboxList
                  items={activeServices.map(service => ({
                    id: service.id,
                    label: `${service.name} (${service.time})`,
                  }))}
                  selectedIds={personFormData.preferredServiceIds}
                  onToggle={handleTogglePreferredService}
                  maxHeight="max-h-40"
                />
              ) : (
                <p className="text-sm text-dark-500 dark:text-dark-400 py-2 text-center">
                  Nenhum culto ativo disponível
                </p>
              )}
            </div>
          </div>

          {/* Additional Notes Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-dark-800 dark:text-dark-200 pb-2 border-b border-dark-200 dark:border-dark-700">
              Observações
            </h3>
            <Textarea
              label="Notas adicionais"
              value={personFormData.notes}
              onChange={e => setPersonFormData({ ...personFormData, notes: e.target.value })}
              placeholder="Observações sobre o servo..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClosePersonModal}
              className="w-full sm:w-auto order-3 sm:order-1"
            >
              Cancelar
            </Button>
            {!editingPerson && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSavePersonAndCreateUser}
                className="w-full sm:w-auto flex items-center justify-center gap-2 order-2"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Salvar e Criar Usuário</span>
                <span className="sm:hidden">Criar Usuário</span>
              </Button>
            )}
            <Button type="submit" variant="primary" className="w-full sm:w-auto order-1 sm:order-3">
              {editingPerson ? 'Salvar Alterações' : 'Adicionar Servo'}
            </Button>
          </div>
        </form>
      </Modal>

      <Alert
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        title="Excluir Servo"
        message="Tem certeza que deseja excluir este servo? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="error"
        showCancel={true}
      />

      <Modal
        isOpen={createUserModal.isOpen}
        onClose={handleCloseCreateUserModal}
        title="Criar Usuário para Servo"
        size="md"
      >
        {creatingUserForPerson && (
          <CreateUserForm
            person={creatingUserForPerson}
            email={userFormData.email}
            password={userFormData.password}
            role={userFormData.role}
            onEmailChange={email => setUserFormData({ ...userFormData, email })}
            onPasswordChange={password => setUserFormData({ ...userFormData, password })}
            onRoleChange={role => setUserFormData({ ...userFormData, role })}
            onSubmit={handleCreateUserSubmit}
            onCancel={handleCloseCreateUserModal}
            isLoading={isLoadingUsers}
          />
        )}
      </Modal>
    </>
  )
}
