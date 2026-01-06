import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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

  const availableTeams = useMemo(() => {
    if (filterMinistry === 'all') {
      return teams.filter(t => t.isActive)
    }
    return teams.filter(t => t.ministryId === filterMinistry && t.isActive)
  }, [filterMinistry, teams])

  // Filter ministries by selected church (already filtered in useMinistries)
  const filteredMinistries = useMemo(() => {
    return ministries.filter(m => m.isActive)
  }, [ministries])

  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      const matchesSearch =
        searchTerm === '' ||
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.phone?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMinistry = filterMinistry === 'all' || person.ministryId === filterMinistry

      const matchesTeam = filterTeam === 'all' || person.teamId === filterTeam

      return matchesSearch && matchesMinistry && matchesTeam
    })
  }, [people, searchTerm, filterMinistry, filterTeam])

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

  function getMinistry(ministryId?: string) {
    if (!ministryId) return undefined
    return ministries.find(m => m.id === ministryId)
  }

  function getTeam(teamId?: string) {
    if (!teamId) return undefined
    return teams.find(t => t.id === teamId)
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ...rawPersonData } = personFormData

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
      const { preferredServiceIds, ...rawPersonData } = personFormData

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

  const listViewRows = filteredPeople.map(person => (
    <TableRow key={person.id}>
      <TableCell>
        <span className="font-medium">{person.name}</span>
      </TableCell>
      <TableCell>{person.email ?? '-'}</TableCell>
      <TableCell>{person.phone ?? '-'}</TableCell>
      <TableCell>{getMinistry(person.ministryId)?.name ?? '-'}</TableCell>
      <TableCell>
        {person.teamMembers && person.teamMembers.length > 0 ? (
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
        ) : getTeam(person.teamId) ? (
          <span className="text-sm">{getTeam(person.teamId)?.name}</span>
        ) : (
          '-'
        )}
      </TableCell>
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
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(person.id)}
            title="Excluir"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))

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
            gridView={gridView}
            listView={{
              headers: [
                'Nome',
                'Email',
                'Telefone',
                'Time',
                'Equipe',
                'Data de Nascimento',
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
        <form onSubmit={handlePersonSubmit} className="space-y-3">
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
          <Select
            label="Time"
            value={personFormData.ministryId}
            onChange={e => handlePersonMinistryChange(e.target.value)}
            options={[
              { value: '', label: 'Selecione um time' },
              ...filteredMinistries.map(m => ({ value: m.id, label: m.name })),
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
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
          <Textarea
            label="Observações"
            value={personFormData.notes}
            onChange={e => setPersonFormData({ ...personFormData, notes: e.target.value })}
            placeholder="Observações sobre o servo..."
            rows={2}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
              Preferências de Cultos para Servir
            </label>
            <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">
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
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={handleClosePersonModal}>
              Cancelar
            </Button>
            {!editingPerson && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSavePersonAndCreateUser}
                className="flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4" />
                Salvar e Criar Usuário
              </Button>
            )}
            <Button type="submit" variant="primary">
              {editingPerson ? 'Salvar Alterações' : 'Adicionar Servo'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        title="Excluir Servo"
        message="Tem certeza que deseja excluir este servo? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
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
