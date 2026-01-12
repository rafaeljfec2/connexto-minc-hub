import { useState, useMemo, useCallback } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { useModal } from '@/hooks/useModal'
import { useViewMode } from '@/hooks/useViewMode'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePeople } from '@/hooks/usePeople'
import { useMinistries } from '@/hooks/useMinistries'
import { useTeams } from '@/hooks/useTeams'
import { useUsers } from '@/hooks/useUsers'
import { useServices } from '@/hooks/useServices'
import { useSort } from '@/hooks/useSort'
import { Person, UserRole, MemberType } from '@minc-hub/shared/types'

import { PeopleMobileView } from './people/components/PeopleMobileView'
import { PeopleDesktopView } from './people/components/PeopleDesktopView'
import { PersonFormModal } from './people/components/PersonFormModal'
import { CreateUserForm } from './people/components/CreateUserForm'

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
  const { users, createUser } = useUsers()
  const { services } = useServices()

  // Modals
  const personModal = useModal()
  const deleteModal = useModal()
  const createUserModal = useModal()

  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Person form state
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)

  // User creation state
  const [creatingUserForPerson, setCreatingUserForPerson] = useState<Person | null>(null)
  const initialUserFormData = {
    email: '',
    password: '',
    role: UserRole.SERVO,
  }
  const [userFormData, setUserFormData] = useState(initialUserFormData)

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

  // Helper functions
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

  function hasUser(personId: string): boolean {
    return users.some(user => user.personId === personId)
  }

  // Effect to sync preloaded data (optional logging removed)

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

  function handleOpenPersonModal(person?: Person) {
    if (person) {
      setEditingPerson(person)
    } else {
      setEditingPerson(null)
    }
    personModal.open()
  }

  function handleClosePersonModal() {
    personModal.close()
    setEditingPerson(null)
  }

  // Form submission handler
  async function handlePersonSubmit(personData: Record<string, unknown>) {
    try {
      // Clean empty strings
      if (!personData.ministryId) delete personData.ministryId
      if (!personData.teamId) delete personData.teamId

      // Team logic compatibility
      if (Array.isArray(personData.teamMembers) && personData.teamMembers.length > 0) {
        const teamMembers = personData.teamMembers as Array<{
          teamId: string
          memberType: MemberType
        }>
        const firstFixedTeam = teamMembers.find(tm => tm.memberType === MemberType.FIXED)
        if (firstFixedTeam) {
          personData.teamId = firstFixedTeam.teamId
        } else {
          personData.teamId = teamMembers[0].teamId
        }
      }

      if (!personData.teamId) delete personData.teamId

      // Remove preferredServiceIds as backend doesn't support it yet
      const { preferredServiceIds: _, ...payload } = personData

      let savedPerson: Person | null = null

      if (editingPerson) {
        savedPerson = await updatePerson(editingPerson.id, payload as unknown as Partial<Person>)
      } else {
        savedPerson = await createPerson(payload as unknown as Person)
      }

      handleClosePersonModal()
      return savedPerson
    } catch (error) {
      console.error('Error submitting person form:', error)
      return null
    }
  }

  async function handleSavePersonAndCreateUser(personData: Record<string, unknown>) {
    const savedPerson = await handlePersonSubmit(personData)
    if (savedPerson) {
      setTimeout(() => {
        handleOpenCreateUserModal(savedPerson)
      }, 200)
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
        console.error('Error deleting person:', error)
      }
    }
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
      console.error('Error creating user for person:', error)
    }
  }

  return (
    <>
      {/* Mobile View */}
      {!isDesktop && (
        <PeopleMobileView
          people={filteredPeople}
          getMinistry={getMinistry}
          getTeam={getTeam}
          hasUser={hasUser}
          isLoading={isLoadingPeople}
          searchTerm={searchTerm}
          hasFilters={searchTerm !== ''}
          onSearchChange={setSearchTerm}
          onPersonEdit={handleOpenPersonModal}
          onPersonDelete={handleDeleteClick}
          onCreateUser={handleOpenCreateUserModal}
          onCreateClick={() => handleOpenPersonModal()}
        />
      )}

      {/* Desktop View */}
      {isDesktop && (
        <PeopleDesktopView
          people={filteredPeople}
          ministries={ministries}
          teams={teams}
          getMinistry={getMinistry}
          getTeam={getTeam}
          hasUser={hasUser}
          searchTerm={searchTerm}
          filterMinistry={filterMinistry}
          filterTeam={filterTeam}
          viewMode={viewMode}
          sortConfig={sortConfig}
          isLoading={isLoadingPeople}
          onSearchChange={setSearchTerm}
          onFilterMinistryChange={value => {
            setFilterMinistry(value)
            setFilterTeam('all')
          }}
          onFilterTeamChange={setFilterTeam}
          onViewModeChange={setViewMode}
          onSort={handleSort}
          onEdit={handleOpenPersonModal}
          onDelete={handleDeleteClick}
          onCreateUser={handleOpenCreateUserModal}
          onCreateClick={() => handleOpenPersonModal()}
        />
      )}

      <PersonFormModal
        isOpen={personModal.isOpen}
        onClose={handleClosePersonModal}
        person={editingPerson}
        ministries={ministries}
        teams={teams}
        services={services}
        isLoading={isLoadingPeople}
        onSubmit={handlePersonSubmit}
        onSaveAndCreateUser={handleSavePersonAndCreateUser}
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
            onEmailChange={email => setUserFormData(prev => ({ ...prev, email }))}
            onPasswordChange={password => setUserFormData(prev => ({ ...prev, password }))}
            onRoleChange={role => setUserFormData(prev => ({ ...prev, role }))}
            onSubmit={handleCreateUserSubmit}
            onCancel={handleCloseCreateUserModal}
          />
        )}
      </Modal>

      <Alert
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.close()
          setDeletingId(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Servo"
        message="Tem certeza que deseja excluir este servo? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="error"
        showCancel={true}
      />
    </>
  )
}
