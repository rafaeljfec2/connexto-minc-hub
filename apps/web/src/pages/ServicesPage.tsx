import { useState, useMemo } from 'react'
import { Alert } from '@/components/ui/Alert'
import { useModal } from '@/hooks/useModal'
import { useViewMode } from '@/hooks/useViewMode'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useServices } from '@/hooks/useServices'
import { useChurch } from '@/contexts/ChurchContext'
import { useSort } from '@/hooks/useSort'
import { Service } from '@minc-hub/shared/types'
import { getServiceTypeLabel } from '@/lib/constants'

import { ServicesMobileView } from './services/components/ServicesMobileView'
import { ServicesDesktopView } from './services/components/ServicesDesktopView'
import { ServiceFormModal } from './services/components/ServiceFormModal'

export default function ServicesPage() {
  const { services, isLoading, createService, updateService, deleteService } = useServices()
  const { selectedChurch } = useChurch()
  const modal = useModal()
  const deleteModal = useModal()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { viewMode, setViewMode } = useViewMode({
    storageKey: 'services-view-mode',
    defaultMode: 'list',
  })

  const { sortConfig, handleSort, sortData } = useSort<Service>({
    defaultKey: 'name',
    defaultDirection: 'asc',
  })

  const filteredServices = useMemo(() => {
    const result = services.filter(service => {
      const matchesSearch =
        searchTerm === '' || service.name.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })

    return sortData(result, {
      name: item => item.name.toLowerCase(),
      type: item => getServiceTypeLabel(item.type).toLowerCase(),
      day: item => item.dayOfWeek,
      time: item => item.time,
      status: item => (item.isActive ? 1 : 0),
    })
  }, [services, searchTerm, sortData])

  function handleOpenModal(service?: Service) {
    if (service) {
      setEditingService(service)
    } else {
      setEditingService(null)
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingService(null)
  }

  async function handleSubmit(data: Omit<Service, 'id' | 'churchId' | 'createdAt' | 'updatedAt'>) {
    if (!selectedChurch) return

    try {
      const serviceData = {
        ...data,
        churchId: selectedChurch.id,
      }

      if (editingService) {
        await updateService(editingService.id, serviceData)
      } else {
        await createService(serviceData)
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error submitting service form:', error)
    }
  }

  function handleDeleteClick(service: Service) {
    setDeletingId(service.id)
    deleteModal.open()
  }

  // Adapter for desktop view which passes ID
  function handleDeleteId(id: string) {
    setDeletingId(id)
    deleteModal.open()
  }

  async function handleDeleteConfirm() {
    if (deletingId) {
      try {
        await deleteService(deletingId)
        setDeletingId(null)
        deleteModal.close()
      } catch (error) {
        console.error('Error deleting service:', error)
      }
    }
  }

  return (
    <>
      {/* Mobile View */}
      {!isDesktop && (
        <ServicesMobileView
          services={filteredServices}
          isLoading={isLoading}
          searchTerm={searchTerm}
          hasFilters={searchTerm !== ''}
          onSearchChange={setSearchTerm}
          onServiceEdit={handleOpenModal}
          onServiceDelete={handleDeleteClick}
          onCreateClick={() => handleOpenModal()}
        />
      )}

      {/* Desktop View */}
      {isDesktop && (
        <ServicesDesktopView
          services={filteredServices}
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

      <ServiceFormModal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        service={editingService}
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
        title="Excluir Culto"
        message="Tem certeza que deseja excluir este culto? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="error"
        showCancel={true}
      />
    </>
  )
}
