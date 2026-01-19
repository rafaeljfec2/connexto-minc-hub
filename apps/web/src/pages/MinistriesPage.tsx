import { useState, useMemo, useCallback } from 'react'
import { Alert } from '@/components/ui/Alert'
import { useModal } from '@/hooks/useModal'
import { useMinistriesQuery } from '@/hooks/queries/useMinistriesQuery'
import { useChurchesQuery } from '@/hooks/queries/useChurchesQuery'
import { useViewMode } from '@/hooks/useViewMode'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useSort } from '@/hooks/useSort'
import { Ministry } from '@minc-hub/shared/types'

import { MinistriesMobileView } from './ministries/components/MinistriesMobileView'
import { MinistriesDesktopView } from './ministries/components/MinistriesDesktopView'
import { MinistryFormModal } from './ministries/components/MinistryFormModal'

export default function MinistriesPage() {
  const { ministries, isLoading, createMinistry, updateMinistry, deleteMinistry } =
    useMinistriesQuery()
  const { churches } = useChurchesQuery()
  const modal = useModal()
  const deleteModal = useModal()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { viewMode, setViewMode } = useViewMode({
    storageKey: 'ministries-view-mode',
    defaultMode: 'list',
  })

  // Pre-load default church ID logic is now handled inside the form modal or its submit handler
  // or we can keep it here if we want to pass a default

  const { sortConfig, handleSort, sortData } = useSort<Ministry>({
    defaultKey: 'name',
    defaultDirection: 'asc',
  })

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

  function handleOpenModal(ministry?: Ministry) {
    if (ministry) {
      setEditingMinistry(ministry)
    } else {
      setEditingMinistry(null)
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingMinistry(null)
  }

  async function handleSubmit(data: Omit<Ministry, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      if (editingMinistry) {
        await updateMinistry({ id: editingMinistry.id, data })
      } else {
        await createMinistry(data)
      }
      handleCloseModal()
    } catch (error) {
      // Error handled by hook
      console.error('Error submitting ministry form:', error)
    }
  }

  function handleDeleteClick(ministry: Ministry) {
    setDeletingId(ministry.id)
    deleteModal.open()
  }

  function handleDeleteId(id: string) {
    setDeletingId(id)
    deleteModal.open()
  }

  async function handleDeleteConfirm() {
    if (deletingId) {
      try {
        await deleteMinistry(deletingId)
        setDeletingId(null)
        deleteModal.close()
      } catch (error) {
        console.error('Error deleting ministry:', error)
      }
    }
  }

  return (
    <>
      {/* Mobile View */}
      {!isDesktop && (
        <MinistriesMobileView
          ministries={filteredMinistries}
          getChurchName={getChurchName}
          isLoading={isLoading}
          searchTerm={searchTerm}
          hasFilters={searchTerm !== ''}
          onSearchChange={setSearchTerm}
          onMinistryEdit={handleOpenModal}
          onMinistryDelete={handleDeleteClick}
          onCreateClick={() => handleOpenModal()}
        />
      )}

      {/* Desktop View */}
      {isDesktop && (
        <MinistriesDesktopView
          ministries={filteredMinistries}
          getChurchName={getChurchName}
          searchTerm={searchTerm}
          viewMode={viewMode}
          sortConfig={sortConfig}
          isLoading={isLoading}
          onSearchChange={setSearchTerm}
          onViewModeChange={setViewMode}
          onSort={handleSort}
          onEdit={handleOpenModal}
          onDelete={handleDeleteId}
          onCreateClick={() => handleOpenModal()}
        />
      )}

      <MinistryFormModal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        ministry={editingMinistry}
        churches={churches}
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
        title="Excluir Time"
        message="Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        showCancel={true}
      />
    </>
  )
}
