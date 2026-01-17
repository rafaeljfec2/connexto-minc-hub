import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { TableRow, TableCell } from '@/components/ui/Table'
import { useModal } from '@/hooks/useModal'
import { useChurches } from '@/hooks/useChurches'
import { useViewMode } from '@/hooks/useViewMode'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { Church } from '@minc-hub/shared/types'
import { ChurchCard } from './churches/components/ChurchCard'
import { ChurchesMobileView } from './churches/components/ChurchesMobileView'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { useSort } from '@/hooks/useSort'
import { SortableColumn } from '@/components/ui/SortableColumn'
import { formatPhone } from '@/utils/phone-mask'

export default function ChurchesPage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { churches, isLoading, createChurch, updateChurch, deleteChurch } = useChurches()
  const modal = useModal()
  const deleteModal = useModal()
  const [editingChurch, setEditingChurch] = useState<Church | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { viewMode, setViewMode } = useViewMode({
    storageKey: 'churches-view-mode',
    defaultMode: 'list',
  })
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  })

  const { sortConfig, handleSort, sortData } = useSort<Church>({
    defaultKey: 'name',
    defaultDirection: 'asc',
  })

  const filteredChurches = useMemo(() => {
    const result = churches.filter(church => {
      const matchesSearch =
        searchTerm === '' ||
        church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.phone?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })

    return sortData(result, {
      name: item => item.name.toLowerCase(),
      address: item => (item.address || '').toLowerCase(),
      phone: item => (item.phone || '').toLowerCase(),
      email: item => (item.email || '').toLowerCase(),
    })
  }, [churches, searchTerm, sortData])

  const renderHeader = (key: string, label: string) => (
    <SortableColumn key={key} sortKey={key} currentSort={sortConfig} onSort={handleSort}>
      {label}
    </SortableColumn>
  )

  function handleOpenModal(church?: Church) {
    if (church) {
      setEditingChurch(church)
      setFormData({
        name: church.name,
        address: church.address ?? '',
        phone: church.phone ? formatPhone(church.phone) : '',
        email: church.email ?? '',
      })
    } else {
      setEditingChurch(null)
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
      })
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingChurch(null)
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (editingChurch) {
        await updateChurch(editingChurch.id, formData)
      } else {
        await createChurch(formData)
      }
      handleCloseModal()
    } catch (err) {
      // Error is already handled by the hook
      console.error('Error saving church:', err)
    }
  }

  function handleDeleteClick(id: string) {
    setDeletingId(id)
    deleteModal.open()
  }

  async function handleDeleteConfirm() {
    if (deletingId) {
      try {
        await deleteChurch(deletingId)
        setDeletingId(null)
        deleteModal.close()
      } catch (err) {
        // Error is already handled by the hook
        console.error('Error deleting church:', err)
      }
    }
  }

  const hasFilters = searchTerm !== ''

  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredChurches.map(church => (
        <ChurchCard
          key={church.id}
          church={church}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          isUpdating={isLoading}
          isDeleting={isLoading && deletingId === church.id}
        />
      ))}
    </div>
  )

  const listViewRows = filteredChurches.map(church => (
    <TableRow key={church.id}>
      <TableCell>
        <span className="font-medium">{church.name}</span>
      </TableCell>
      <TableCell>{church.address ?? '-'}</TableCell>
      <TableCell>{church.phone ?? '-'}</TableCell>
      <TableCell>{church.email ?? '-'}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="action-edit" size="sm" onClick={() => handleOpenModal(church)}>
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button variant="action-delete" size="sm" onClick={() => handleDeleteClick(church.id)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))

  const handleChurchEdit = (church: Church) => {
    handleOpenModal(church)
  }

  const handleChurchDelete = (church: Church) => {
    handleDeleteClick(church.id)
  }

  return (
    <>
      {/* Mobile View */}
      {!isDesktop && (
        <ChurchesMobileView
          churches={filteredChurches}
          isLoading={isLoading}
          searchTerm={searchTerm}
          hasFilters={hasFilters}
          onSearchChange={setSearchTerm}
          onChurchEdit={handleChurchEdit}
          onChurchDelete={handleChurchDelete}
          onCreateClick={() => handleOpenModal()}
        />
      )}

      {/* Desktop View */}
      <div className="hidden lg:block">
        <CrudPageLayout
          title="Mincs"
          description="Gerencie as igrejas cadastradas no sistema"
          createButtonLabel="Nova Igreja"
          onCreateClick={() => handleOpenModal()}
          hasFilters={hasFilters}
          isEmpty={filteredChurches.length === 0 && !isLoading}
          emptyTitle={hasFilters ? 'Nenhuma igreja encontrada' : 'Nenhuma igreja cadastrada'}
          emptyDescription={
            hasFilters
              ? 'Tente ajustar os filtros para encontrar igrejas'
              : 'Comece adicionando uma nova igreja'
          }
          createButtonIcon={<PlusIcon className="h-5 w-5 mr-2" />}
          filters={
            <CrudFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Buscar por nome, endereço, email ou telefone..."
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
                  renderHeader('address', 'Endereço'),
                  renderHeader('phone', 'Telefone'),
                  renderHeader('email', 'Email'),
                  'Ações',
                ],
                rows: listViewRows,
              }}
            />
          }
        />
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        title={editingChurch ? 'Editar Igreja' : 'Nova Igreja'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="space-y-4 overflow-y-auto overscroll-contain max-h-[calc(75vh-12rem)]">
            <Input
              label="Nome da Igreja *"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Endereço"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Rua, número - Bairro, Cidade"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Telefone"
                value={formData.phone}
                onChange={e => {
                  const formatted = formatPhone(e.target.value)
                  setFormData({ ...formData, phone: formatted })
                }}
                placeholder="(11) 99999-9999"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@igreja.com"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-dark-200 dark:border-dark-800 mt-4 flex-shrink-0 pb-safe">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Salvando...' : editingChurch ? 'Salvar Alterações' : 'Criar Igreja'}
            </Button>
          </div>
        </form>
      </Modal>

      <Alert
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        title="Excluir Igreja"
        message="Tem certeza que deseja excluir esta igreja? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="error"
        showCancel={true}
      />
    </>
  )
}
