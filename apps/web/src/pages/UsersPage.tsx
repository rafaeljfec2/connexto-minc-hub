import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Alert } from '@/components/ui/Alert'
import { TableRow, TableCell } from '@/components/ui/Table'
import { useModal } from '@/hooks/useModal'
import { useViewMode } from '@/hooks/useViewMode'
import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { User, UserRole } from '@minc-hub/shared/types'
import { UserCard } from './users/components/UserCard'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { useSort } from '@/hooks/useSort'
import { SortableColumn } from '@/components/ui/SortableColumn'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ROLE_OPTIONS, getRoleLabel } from '@/lib/userUtils'
import { useUsers } from '@/hooks/useUsers'
import { usePeople } from '@/hooks/usePeople'

export default function UsersPage() {
  const { users, isLoading, createUser, updateUser, deleteUser } = useUsers()
  const { people } = usePeople()
  const modal = useModal()
  const deleteModal = useModal()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { viewMode, setViewMode } = useViewMode({
    storageKey: 'users-view-mode',
    defaultMode: 'list',
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.SERVO,
    personId: '',
    canCheckIn: false,
  })

  const { sortConfig, handleSort, sortData } = useSort<User>({
    defaultKey: 'name',
    defaultDirection: 'asc',
  })

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

  const renderHeader = (key: string, label: string) => (
    <SortableColumn key={key} sortKey={key} currentSort={sortConfig} onSort={handleSort}>
      {label}
    </SortableColumn>
  )

  function getPersonName(personId?: string): string {
    if (!personId) return 'Não vinculado'
    return people.find(p => p.id === personId)?.name ?? 'Não encontrado'
  }

  function handleOpenModal(user?: User) {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        personId: user.personId ?? '',
        canCheckIn: user.canCheckIn ?? false,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: UserRole.SERVO,
        personId: '',
        canCheckIn: false,
      })
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: UserRole.SERVO,
      personId: '',
      canCheckIn: false,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (editingUser) {
      await updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        personId: formData.personId || undefined,
        canCheckIn: formData.canCheckIn,
      })
    } else {
      await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        personId: formData.personId || undefined,
        canCheckIn: formData.canCheckIn,
      })
    }
    handleCloseModal()
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

  const hasFilters = searchTerm !== ''

  const gridView = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredUsers.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          isUpdating={isLoading}
          isDeleting={isLoading}
        />
      ))}
    </div>
  )

  const listViewRows = filteredUsers.map(user => (
    <TableRow key={user.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
            {user.name.charAt(0).toUpperCase()}
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
          <Button variant="action-edit" size="sm" onClick={() => handleOpenModal(user)}>
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button variant="action-delete" size="sm" onClick={() => handleDeleteClick(user.id)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))

  return (
    <>
      <CrudPageLayout
        title="Usuários"
        description="Gerencie usuários do sistema e suas permissões"
        createButtonLabel="Novo Usuário"
        onCreateClick={() => handleOpenModal()}
        hasFilters={hasFilters}
        isEmpty={filteredUsers.length === 0}
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
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nome, email ou papel..."
            viewMode={viewMode}
            onViewModeChange={setViewMode}
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

      <Modal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome *"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
            {!editingUser && (
              <Input
                label="Senha *"
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
            )}
          </div>
          <Select
            label="Papel *"
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
            options={ROLE_OPTIONS}
          />
          <Select
            label="Servo Vinculado (Opcional)"
            value={formData.personId}
            onChange={e => setFormData({ ...formData, personId: e.target.value })}
            options={[
              { value: '', label: 'Nenhum' },
              ...people.map(person => ({
                value: person.id,
                label: person.name,
              })),
            ]}
            disabled={people.length === 0}
          />
          <div className="pt-2">
            <Checkbox
              id="canCheckIn"
              label="Permitir realizar check-in (Scan QR Code)"
              checked={formData.canCheckIn}
              onChange={e => setFormData({ ...formData, canCheckIn: e.target.checked })}
              disabled={formData.role === UserRole.ADMIN}
            />
            <p className="text-xs text-dark-500 mt-1 ml-6">
              Usuários com papel Admin sempre têm permissão.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">{editingUser ? 'Salvar Alterações' : 'Criar Usuário'}</Button>
          </div>
        </form>
      </Modal>

      <Alert
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.close()
          setDeletingId(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
      />
    </>
  )
}
