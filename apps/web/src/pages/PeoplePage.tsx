import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { DataTable } from '@/components/ui/DataTable'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageWithCrud } from '@/components/pages/PageWithCrud'
import { useModal } from '@/hooks/useModal'
import { useCrud } from '@/hooks/useCrud'
import { Person } from '@/types'
import { formatDate } from '@/lib/utils'

const MOCK_PEOPLE: Person[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '(11) 99999-9999',
    birthDate: '1990-01-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    phone: '(11) 88888-8888',
    birthDate: '1985-05-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function PeoplePage() {
  const { items: people, create, update, remove } = useCrud<Person>({
    initialItems: MOCK_PEOPLE,
  })
  const modal = useModal()
  const deleteModal = useModal()
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    notes: '',
  })

  function handleOpenModal(person?: Person) {
    if (person) {
      setEditingPerson(person)
      setFormData({
        name: person.name,
        email: person.email ?? '',
        phone: person.phone ?? '',
        birthDate: person.birthDate ?? '',
        address: person.address ?? '',
        notes: person.notes ?? '',
      })
    } else {
      setEditingPerson(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        address: '',
        notes: '',
      })
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingPerson(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      address: '',
      notes: '',
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (editingPerson) {
      update(editingPerson.id, formData)
    } else {
      create(formData)
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

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      render: (person: Person) => (
        <span className="font-medium">{person.name}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (person: Person) => person.email ?? '-',
    },
    {
      key: 'phone',
      label: 'Telefone',
      render: (person: Person) => person.phone ?? '-',
    },
    {
      key: 'birthDate',
      label: 'Data de Nascimento',
      render: (person: Person) =>
        person.birthDate ? formatDate(person.birthDate) : '-',
    },
  ]

  return (
    <>
      <PageWithCrud
        title="Servos"
        description="Gerencie servos do Time Boas-Vindas"
        createButtonLabel="Adicionar Servo"
        items={people}
        searchFields={['name', 'email', 'phone']}
        searchPlaceholder="Buscar por nome, email ou telefone..."
        emptyMessage="Nenhum servo cadastrado"
        emptySearchMessage="Nenhum servo encontrado"
        tableContent={(paginatedItems) => (
          <DataTable
            data={paginatedItems}
            columns={columns}
            hasSearch={false}
            actions={(person) => (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenModal(person)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(person.id)}
                >
                  Excluir
                </Button>
              </>
            )}
          />
        )}
        onCreateClick={() => handleOpenModal()}
      />

      <Modal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        title={editingPerson ? 'Editar Servo' : 'Novo Servo'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Telefone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
          <Input
            label="Data de Nascimento"
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          />
          <Input
            label="Endereço"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Textarea
            label="Observações"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Observações sobre o servo..."
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
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
    </>
  )
}
