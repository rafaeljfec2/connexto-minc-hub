import { useState, useMemo, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ComboBox } from '@/components/ui/ComboBox'
import { Checkbox } from '@/components/ui/Checkbox'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Alert } from '@/components/ui/Alert'
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
import { MinistryItemCard } from './ministries/components/MinistryItemCard'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { useSort } from '@/hooks/useSort'
import { SortableColumn } from '@/components/ui/SortableColumn'

export default function MinistriesPage() {
  const { ministries, isLoading, createMinistry, updateMinistry, deleteMinistry } = useMinistries()
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

  const { sortConfig, handleSort, sortData } = useSort<Ministry>({
    defaultKey: 'name',
    defaultDirection: 'asc',
  })

  // Update churchId when churches are loaded
  useEffect(() => {
    if (churches.length > 0 && !formData.churchId) {
      setFormData(prev => ({ ...prev, churchId: churches[0]?.id ?? '' }))
    }
  }, [churches, formData.churchId])

  const getChurchName = useCallback(
    (churchId: string) => {
      return churches.find(c => c.id === churchId)?.name ?? 'Igreja não encontrada'
    },
    [churches]
  )

  const filteredMinistries = useMemo(() => {
    const result = ministries.filter(ministry => {
      const matchesSearch =
        ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ministry.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getChurchName(ministry.churchId).toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })

    return sortData(result, {
      name: item => item.name.toLowerCase(),
      description: item => (item.description || '').toLowerCase(),
      church: item => (churches.find(c => c.id === item.churchId)?.name ?? '').toLowerCase(),
      status: item => (item.isActive ? 1 : 0),
    })
  }, [ministries, searchTerm, sortData, churches, getChurchName])

  const renderHeader = (key: string, label: string) => (
    <SortableColumn key={key} sortKey={key} currentSort={sortConfig} onSort={handleSort}>
      {label}
    </SortableColumn>
  )

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

  const handleMinistryMenuClick = (ministry: Ministry) => {
    // Abrir menu de opções (editar/excluir)
    handleOpenModal(ministry)
  }

  // Layout mobile com novo design
  const mobileListView = (
    <div className="lg:hidden">
      {/* Barra de busca */}
      <div className="px-4 pt-4 pb-3 bg-white dark:bg-dark-950">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-dark-400 dark:text-dark-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar time..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-lg text-sm text-dark-900 dark:text-dark-50 placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Seção Meus Times */}
      <div className="px-4 py-3 bg-white dark:bg-dark-950 border-b border-dark-200 dark:border-dark-800">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-dark-900 dark:text-dark-50">Meus Times</h2>
          <button className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Ver todos
          </button>
        </div>
      </div>

      {/* Lista de times */}
      <div className="bg-dark-50 dark:bg-dark-950 min-h-screen pb-20 px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredMinistries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-dark-500 dark:text-dark-400">
              {hasFilters ? 'Nenhum time encontrado' : 'Nenhum time cadastrado'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMinistries.map(ministry => (
              <MinistryItemCard
                key={ministry.id}
                ministry={ministry}
                onMenuClick={handleMinistryMenuClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredMinistries.map(ministry => (
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

  const listViewRows = filteredMinistries.map(ministry => (
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
          <Button variant="action-edit" size="sm" onClick={() => handleOpenModal(ministry)}>
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button variant="action-delete" size="sm" onClick={() => handleDeleteClick(ministry.id)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))

  return (
    <>
      {/* Mobile View - Novo Layout */}
      {mobileListView}

      {/* Desktop View - Layout Original */}
      <div className="hidden lg:block">
        <CrudPageLayout
          title="Times"
          description="Gerencie os times (ministérios) da igreja"
          createButtonLabel="Novo Time"
          onCreateClick={() => handleOpenModal()}
          hasFilters={hasFilters}
          isEmpty={filteredMinistries.length === 0 && !isLoading}
          emptyTitle={hasFilters ? 'Nenhum time encontrado' : 'Nenhum time cadastrado'}
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
                headers: [
                  renderHeader('name', 'Nome'),
                  renderHeader('description', 'Descrição'),
                  renderHeader('church', 'Igreja'),
                  renderHeader('status', 'Status'),
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
        title={editingMinistry ? 'Editar Time' : 'Novo Time'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ComboBox
            label="Igreja *"
            value={formData.churchId || null}
            onValueChange={val => setFormData({ ...formData, churchId: val || '' })}
            options={churches.map(church => ({
              value: church.id,
              label: church.name,
            }))}
            placeholder="Selecione uma igreja"
            searchable
            searchPlaceholder="Buscar igreja..."
          />
          <Input
            label="Nome do Time *"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label="Descrição"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição do time..."
            rows={4}
          />
          <Checkbox
            label="Time ativo"
            checked={formData.isActive}
            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingMinistry ? 'Salvar Alterações' : 'Criar Time'}
            </Button>
          </div>
        </form>
      </Modal>

      <Alert
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        title="Excluir Time"
        message="Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        showCancel={true}
      />
    </>
  )
}
