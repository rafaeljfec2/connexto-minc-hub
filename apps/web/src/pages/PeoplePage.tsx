import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { useModal } from '@/hooks/useModal'
import { useViewMode } from '@/hooks/useViewMode'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePeopleQuery } from '@/hooks/queries/usePeopleQuery'
import { useMinistriesQuery } from '@/hooks/queries/useMinistriesQuery'
import { useTeamsQuery } from '@/hooks/queries/useTeamsQuery'
import { useUsers } from '@/hooks/useUsers'
import { useAccessCodes, AccessCodeScopeType } from '@/hooks/useAccessCodes'
import { useChurch } from '@/contexts/ChurchContext'
import { useToast } from '@/contexts/ToastContext'
import { useSort } from '@/hooks/useSort'
import { usePagination } from '@/hooks/usePagination'
import { Person, UserRole } from '@minc-hub/shared/types'
import { openWhatsApp, formatWhatsAppMessage, getActivationLink } from '@/utils/whatsapp'

import { PeopleMobileView } from './people/components/PeopleMobileView'
import { PeopleDesktopView } from './people/components/PeopleDesktopView'
import { CreateUserForm } from './people/components/CreateUserForm'
import { PeopleImportModal } from '@/components/people/PeopleImportModal'

export default function PeoplePage() {
  const navigate = useNavigate()
  const { people, isLoading: isLoadingPeople, deletePerson } = usePeopleQuery()

  const { ministries } = useMinistriesQuery()
  const { teams } = useTeamsQuery()
  const { users, createUser } = useUsers()
  const { createCode } = useAccessCodes()
  const { selectedChurch } = useChurch()
  const { showError, showSuccess } = useToast()

  // Modals
  const deleteModal = useModal()
  const createUserModal = useModal()
  const importModal = useModal()

  const isDesktop = useMediaQuery('(min-width: 1024px)')

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
  const [itemsPerPage, setItemsPerPage] = useState(10)

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
        (person.name && person.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (person.email && person.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (person.phone && person.phone.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesMinistry = filterMinistry === 'all' || person.ministryId === filterMinistry
      const matchesTeam = filterTeam === 'all' || person.teamId === filterTeam

      return matchesSearch && matchesMinistry && matchesTeam
    })

    return sortData(result, {
      name: item => (item.name || '').toLowerCase(),
      email: item => (item.email || '').toLowerCase(),
      phone: item => (item.phone || '').toLowerCase(),
      ministry: item => (getMinistry(item.ministryId)?.name || '').toLowerCase(),
      team: item => (getTeam(item.teamId)?.name || '').toLowerCase(),
      birthday: item => (item.birthDate ? new Date(item.birthDate).getTime() : 0),
    })
  }, [people, searchTerm, filterMinistry, filterTeam, sortData, getMinistry, getTeam])

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedPeople,
    setCurrentPage,
    totalItems,
  } = usePagination({
    items: filteredPeople,
    itemsPerPage,
  })

  // Reset to page 1 when filters change
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value)
      setCurrentPage(1)
    },
    [setCurrentPage]
  )

  const handleFilterMinistryChange = useCallback(
    (value: string) => {
      setFilterMinistry(value)
      setFilterTeam('all')
      setCurrentPage(1)
    },
    [setCurrentPage]
  )

  const handleFilterTeamChange = useCallback(
    (value: string) => {
      setFilterTeam(value)
      setCurrentPage(1)
    },
    [setCurrentPage]
  )

  function handleOpenPersonModal(person?: Person) {
    if (person) {
      navigate(`/people/${person.id}/edit`)
    } else {
      navigate('/people/new')
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

  async function handleSendWhatsApp(person: Person) {
    try {
      // Validar se tem telefone
      if (!person.phone?.trim()) {
        showError('Este servo não possui telefone cadastrado')
        return
      }

      // Validar se tem igreja selecionada
      if (!selectedChurch) {
        showError('Selecione uma igreja antes de enviar o código de acesso')
        return
      }

      // Determinar escopo do código de acesso
      // Prioridade: Team > Ministry > Church
      let scopeType: AccessCodeScopeType
      let scopeId: string

      if (person.teamId) {
        scopeType = AccessCodeScopeType.TEAM
        scopeId = person.teamId
      } else if (person.ministryId) {
        scopeType = AccessCodeScopeType.MINISTRY
        scopeId = person.ministryId
      } else {
        scopeType = AccessCodeScopeType.CHURCH
        scopeId = selectedChurch.id
      }

      // Gerar código único baseado no nome e timestamp
      const codeBase = person.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 3)
        .join('')
        .toUpperCase()
      const timestamp = Date.now().toString().slice(-4)
      const accessCode = `${codeBase}${timestamp}`.substring(0, 10)

      // Criar código de acesso
      const createdCode = await createCode({
        code: accessCode,
        scopeType,
        scopeId,
        expiresInDays: 30,
        maxUsages: 1, // Código único para esta pessoa
      })

      if (!createdCode) {
        showError('Erro ao criar código de acesso')
        return
      }

      // Gerar link de ativação
      const activationLink = getActivationLink()

      // Formatar mensagem
      const message = formatWhatsAppMessage(person.name, createdCode.code, activationLink)

      // Abrir WhatsApp
      openWhatsApp(person.phone, message)

      showSuccess('WhatsApp aberto com código de acesso!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar WhatsApp'
      showError(errorMessage)
    }
  }

  return (
    <>
      {/* Mobile View */}
      {!isDesktop && (
        <PeopleMobileView
          people={paginatedPeople}
          getMinistry={getMinistry}
          getTeam={getTeam}
          teams={teams}
          hasUser={hasUser}
          isLoading={isLoadingPeople}
          searchTerm={searchTerm}
          hasFilters={searchTerm !== ''}
          onSearchChange={value => {
            setSearchTerm(value)
            setCurrentPage(1)
          }}
          onPersonEdit={handleOpenPersonModal}
          onPersonDelete={handleDeleteClick}
          onCreateUser={handleOpenCreateUserModal}
          onSendWhatsApp={handleSendWhatsApp}
          onCreateClick={() => handleOpenPersonModal()}
          onImportClick={() => importModal.open()}
          // Pagination props
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={totalItems}
        />
      )}

      {/* Desktop View */}
      {isDesktop && (
        <PeopleDesktopView
          people={paginatedPeople}
          totalItems={totalItems}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
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
          onSearchChange={handleSearchChange}
          onFilterMinistryChange={handleFilterMinistryChange}
          onFilterTeamChange={handleFilterTeamChange}
          onViewModeChange={setViewMode}
          onSort={handleSort}
          onEdit={handleOpenPersonModal}
          onDelete={handleDeleteClick}
          onCreateUser={handleOpenCreateUserModal}
          onSendWhatsApp={handleSendWhatsApp}
          onCreateClick={() => handleOpenPersonModal()}
          onImportClick={() => importModal.open()}
        />
      )}

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

      <PeopleImportModal
        isOpen={importModal.isOpen}
        onClose={() => importModal.close()}
        onImportComplete={() => {
          importModal.close()
          showSuccess('Importação concluída com sucesso!')
        }}
      />
    </>
  )
}
