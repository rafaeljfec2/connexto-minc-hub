import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageWithCrud } from '@/components/pages/PageWithCrud'
import { useModal } from '@/hooks/useModal'
import { useCrud } from '@/hooks/useCrud'
import { Ministry, Church } from '@/types'

const MOCK_CHURCHES: Church[] = [
  {
    id: '1',
    name: 'Minha Igreja na Cidade - Sede',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const MOCK_MINISTRIES: Ministry[] = [
  {
    id: '1',
    name: 'Time Boas-Vindas',
    description: 'Ministério responsável pelo acolhimento e boas-vindas',
    churchId: '1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Louvor',
    description: 'Ministério de música e adoração',
    churchId: '1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function MinistriesPage() {
  const { items: ministries, create, update, remove } = useCrud<Ministry>({
    initialItems: MOCK_MINISTRIES,
  })
  const [churches] = useState<Church[]>(MOCK_CHURCHES)
  const modal = useModal()
  const deleteModal = useModal()
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    churchId: churches[0]?.id ?? '',
    isActive: true,
  })

  function handleOpenModal(ministry?: Ministry) {
    if (ministry) {
      setEditingMinistry(ministry)
      setFormData({
        name: ministry.name,
        description: ministry.description ?? '',
        churchId: ministry.churchId,
        isActive: ministry.isActive,
      })
    } else {
      setEditingMinistry(null)
      setFormData({
        name: '',
        description: '',
        churchId: churches[0]?.id ?? '',
        isActive: true,
      })
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingMinistry(null)
    setFormData({
      name: '',
      description: '',
      churchId: churches[0]?.id ?? '',
      isActive: true,
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (editingMinistry) {
      update(editingMinistry.id, formData)
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

  function getChurchName(churchId: string) {
    return churches.find((c) => c.id === churchId)?.name ?? 'Igreja não encontrada'
  }

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      render: (ministry: Ministry) => (
        <span className="font-medium">{ministry.name}</span>
      ),
    },
    {
      key: 'description',
      label: 'Descrição',
      render: (ministry: Ministry) => ministry.description ?? '-',
    },
    {
      key: 'churchId',
      label: 'Igreja',
      render: (ministry: Ministry) => getChurchName(ministry.churchId),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (ministry: Ministry) => (
        <StatusBadge status={ministry.isActive ? 'active' : 'inactive'}>
          {ministry.isActive ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      ),
    },
  ]

  return (
    <>
      <PageWithCrud
        title="Times"
        description="Gerencie os times (ministérios) da igreja"
        createButtonLabel="Novo Time"
        items={ministries}
        searchFields={['name', 'description']}
        searchPlaceholder="Buscar por nome ou descrição..."
        emptyMessage="Nenhum time cadastrado"
        emptySearchMessage="Nenhum time encontrado"
        tableContent={(paginatedItems) => (
          <DataTable
            data={paginatedItems}
            columns={columns}
            hasSearch={false}
            actions={(ministry) => (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenModal(ministry)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(ministry.id)}
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
        title={editingMinistry ? 'Editar Time' : 'Novo Time'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Igreja *"
            value={formData.churchId}
            onChange={(e) =>
              setFormData({ ...formData, churchId: e.target.value })
            }
            options={churches.map((church) => ({
              value: church.id,
              label: church.name,
            }))}
            required
          />
          <Input
            label="Nome do Time *"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
          <Textarea
            label="Descrição"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Descrição do time..."
            rows={4}
          />
          <Checkbox
            label="Time ativo"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
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
              {editingMinistry ? 'Salvar Alterações' : 'Criar Time'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        title="Excluir Time"
        message="Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  )
}
