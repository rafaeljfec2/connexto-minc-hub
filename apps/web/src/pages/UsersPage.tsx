import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TableRow, TableCell } from '@/components/ui/Table'
import { useModal } from '@/hooks/useModal'
import { useCrud } from '@/hooks/useCrud'
import { useViewMode } from '@/hooks/useViewMode'
import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { User, UserRole, Person } from '@/types'
import { UserCard } from './users/components/UserCard'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { MOCK_USERS, MOCK_PEOPLE } from '@/lib/mockData'
import { ROLE_OPTIONS, getRoleLabel } from '@/lib/userUtils'

export default function UsersPage() {
  const { items: users, create, update, remove } = useCrud<User>({
    initialItems: MOCK_USERS,
  })
  const [people] = useState<Person[]>(MOCK_PEOPLE)
  const modal = useModal()
  const deleteModal = useModal()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { viewMode, setViewMode } = useViewMode({
    storageKey: 'users-view-mode',
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.SERVO,
    personId: '',
  })

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchTerm === '' ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getRoleLabel(user.role).toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [users, searchTerm])

  function getPersonName(personId?: string): string {
    if (!personId) return 'Não vinculado'
    return people.find((p) => p.id === personId)?.name ?? 'Não encontrado'
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
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: UserRole.SERVO,
        personId: '',
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
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (editingUser) {
      update(editingUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        personId: formData.personId || undefined,
      })
    } else {
      create({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        personId: formData.personId || undefined,
      })
    }

    handleCloseModal()
  }

  function handleDeleteClick(id: string) {
    setDeletingId(id)
    deleteModal.open()
  }

  function handleDeleteConfirm() {
    if (deletingId) {
      remove(deletingId)
      setDeletingId(null)
    }
  }

  const hasFilters = searchTerm !== ''

  const gridView = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredUsers.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          isUpdating={false}
          isDeleting={false}
        />
      ))}
    </div>
  )

  const listViewRows = filteredUsers.map((user) => (
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
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(user)}>
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(user.id)}>
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
              headers: ['Nome', 'Email', 'Papel', 'Servo Vinculado', 'Ações'],
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          {!editingUser && (
            <Input
              label="Senha *"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
            />
          )}
          <Select
            label="Papel *"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            options={ROLE_OPTIONS}
          />
          <Select
            label="Servo Vinculado (Opcional)"
            value={formData.personId}
            onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
            options={[
              { value: '', label: 'Nenhum' },
              ...people.map((person) => ({
                value: person.id,
                label: person.name,
              })),
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
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
