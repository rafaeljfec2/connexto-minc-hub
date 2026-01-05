import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TableRow, TableCell } from '@/components/ui/Table'
import { useModal } from '@/hooks/useModal'
import { useMinistries } from '@/hooks/useMinistries'
import { useChurches } from '@/hooks/useChurches'
import { useViewMode } from '@/hooks/useViewMode'
import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { Ministry } from '@minc-hub/shared/types'
import { MinistryCard } from './ministries/components/MinistryCard'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'

export default function MinistriesPage() {
  const {
    ministries,
    isLoading,
    createMinistry,
    updateMinistry,
    deleteMinistry,
  } = useMinistries()
  const { churches } = useChurches()
  const modal = useModal()
  const deleteModal = useModal()
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { viewMode, setViewMode } = useViewMode({
    storageKey: 'ministries-view-mode',
    defaultMode: 'list',
  })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    churchId: '',
    isActive: true,
  })

  // Update churchId when churches are loaded
  useEffect(() => {
    if (churches.length > 0 && !formData.churchId) {
      setFormData(prev => ({ ...prev, churchId: churches[0]?.id ?? '' }))
    }
  }, [churches, formData.churchId])

  const filteredMinistries = useMemo(() => {
    return ministries.filter((ministry) => {
      const matchesSearch =
        searchTerm === '' ||
        ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ministry.description?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [ministries, searchTerm])

  function getChurchName(churchId: string) {
    return churches.find((c) => c.id === churchId)?.name ?? 'Igreja não encontrada'
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (editingMinistry) {
        await updateMinistry(editingMinistry.id, formData)
      } else {
        await createMinistry(formData)
      }
      handleCloseModal()
    } catch (error) {
      // Error already handled in the hook with toast
    }
  }

  function handleDeleteClick(id: string) {
    setDeletingId(id)
    deleteModal.open()
  }

  async function handleDeleteConfirm() {
    if (deletingId) {
      try {
        await deleteMinistry(deletingId)
        setDeletingId(null)
      } catch (error) {
        // Error already handled in the hook with toast
      }
    }
  }

  const hasFilters = searchTerm !== ''

  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredMinistries.map((ministry) => (
        <MinistryCard
          key={ministry.id}
          ministry={ministry}
          churchName={getChurchName(ministry.churchId)}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          isUpdating={isLoading}
          isDeleting={isLoading}
        />
      ))}
    </div>
  )

  const listViewRows = filteredMinistries.map((ministry) => (
    <TableRow key={ministry.id}>
      <TableCell>
        <span className="font-medium">{ministry.name}</span>
      </TableCell>
      <TableCell>{ministry.description ?? '-'}</TableCell>
      <TableCell>{getChurchName(ministry.churchId)}</TableCell>
      <TableCell>
        <StatusBadge status={ministry.isActive ? 'active' : 'inactive'}>
          {ministry.isActive ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(ministry)}
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(ministry.id)}
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
        title="Times"
        description="Gerencie os times (ministérios) da igreja"
        createButtonLabel="Novo Time"
        onCreateClick={() => handleOpenModal()}
        hasFilters={hasFilters}
        isEmpty={filteredMinistries.length === 0 && !isLoading}
        emptyTitle={
          hasFilters ? 'Nenhum time encontrado' : 'Nenhum time cadastrado'
        }
        emptyDescription={
          hasFilters
            ? 'Tente ajustar os filtros para encontrar times'
            : 'Comece adicionando um novo time'
        }
        createButtonIcon={<PlusIcon className="h-5 w-5 mr-2" />}
        filters={
          <CrudFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nome ou descrição..."
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        }
        content={
          <CrudView
            viewMode={viewMode}
            gridView={gridView}
            listView={{
              headers: ['Nome', 'Descrição', 'Igreja', 'Status', 'Ações'],
              rows: listViewRows,
            }}
          />
        }
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
