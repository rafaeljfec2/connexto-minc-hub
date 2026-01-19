import { useState, useMemo, useCallback } from 'react'
import { Alert } from '@/components/ui/Alert'
import { useModal } from '@/hooks/useModal'
import { useViewMode } from '@/hooks/useViewMode'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { User, UserRole } from '@minc-hub/shared/types'
import { useSort } from '@/hooks/useSort'
import { getRoleLabel } from '@/lib/userUtils'
import { useUsersQuery } from '@/hooks/queries/useUsersQuery'
import { usePeopleQuery } from '@/hooks/queries/usePeopleQuery'

import { UsersMobileView } from './users/components/UsersMobileView'
import { UsersDesktopView } from './users/components/UsersDesktopView'
import { UserFormModal } from './users/components/UserFormModal'

export default function UsersPage() {
  const { users, isLoading, createUser, updateUser, deleteUser } = useUsersQuery()
  const { people } = usePeopleQuery()

  const modal = useModal()
  const deleteModal = useModal()

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const { viewMode, setViewMode } = useViewMode({
    storageKey: 'users-view-mode',
    defaultMode: 'list',
  })

  // Sorting
  const { sortConfig, handleSort, sortData } = useSort<User>({
    defaultKey: 'name',
    defaultDirection: 'asc',
  })

  // Helper function to get linked person's name
  const getPersonName = useCallback(
    (personId?: string) => {
      if (!personId) return 'Não vinculado'
      return people.find(p => p.id === personId)?.name ?? 'Não encontrado'
    },
    [people]
  )

  // Filtering and Sorting
  const filteredUsers = useMemo(() => {
    const result = users.filter(user => {
      const matchesSearch =
        searchTerm === '' ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getRoleLabel(user.role).toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })

    return sortData(result, {
      name: item => item.name.toLowerCase(),
      email: item => item.email.toLowerCase(),
      role: item => getRoleLabel(item.role).toLowerCase(),
      person: item =>
        (item.personId ? people.find(p => p.id === item.personId)?.name : '')?.toLowerCase() ?? '',
    })
  }, [users, searchTerm, sortData, people])

  // Handlers
  function handleOpenModal(user?: User) {
    if (user) {
      setEditingUser(user)
    } else {
      setEditingUser(null)
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingUser(null)
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    try {
      if (editingUser) {
        await updateUser({
          id: editingUser.id,
          data: {
            name: formData.name as string,
            email: formData.email as string,
            role: formData.role as UserRole,
            personId: (formData.personId as string) || undefined,
            canCheckIn: formData.canCheckIn as boolean,
          },
        })
      } else {
        await createUser({
          name: formData.name as string,
          email: formData.email as string,
          password: formData.password as string,
          role: formData.role as UserRole,
          personId: (formData.personId as string) || undefined,
          canCheckIn: formData.canCheckIn as boolean,
        })
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving user:', error)
    }
  }

  function handleDeleteClick(id: string) {
    setDeletingId(id)
    deleteModal.open()
  }

  async function handleDeleteConfirm() {
    if (deletingId) {
      await deleteUser(deletingId)
      setDeletingId(null)
      deleteModal.close()
    }
  }

  return (
    <>
      {/* Mobile View */}
      {!isDesktop && (
        <UsersMobileView
          users={filteredUsers}
          isLoading={isLoading}
          searchTerm={searchTerm}
          hasFilters={searchTerm !== ''}
          getPersonName={getPersonName}
          onSearchChange={setSearchTerm}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          onCreateClick={() => handleOpenModal()}
        />
      )}

      {/* Desktop View */}
      {isDesktop && (
        <UsersDesktopView
          users={filteredUsers}
          searchTerm={searchTerm}
          viewMode={viewMode}
          sortConfig={sortConfig}
          isLoading={isLoading}
          getPersonName={getPersonName}
          onSearchChange={setSearchTerm}
          onViewModeChange={setViewMode}
          onSort={handleSort}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          onCreateClick={() => handleOpenModal()}
        />
      )}

      <UserFormModal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        user={editingUser}
        people={people}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />

      <Alert
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.close()
          setDeletingId(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        confirmText="Sim"
        cancelText="Não"
        type="error"
        showCancel={true}
      />
    </>
  )
}
