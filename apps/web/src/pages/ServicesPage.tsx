import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Alert } from '@/components/ui/Alert'
import { TableRow, TableCell } from '@/components/ui/Table'
import { useModal } from '@/hooks/useModal'
import { useViewMode } from '@/hooks/useViewMode'
import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { Service, ServiceType } from '@minc-hub/shared/types'
import { formatTime } from '@minc-hub/shared/utils'
import { DAYS_OF_WEEK, SERVICE_TYPES, getDayLabel, getServiceTypeLabel } from '@/lib/constants'
import { ServiceCard } from './services/components/ServiceCard'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { useServices } from '@/hooks/useServices'
import { useChurch } from '@/contexts/ChurchContext'
import { useSort } from '@/hooks/useSort'
import { SortableColumn } from '@/components/ui/SortableColumn'

export default function ServicesPage() {
  const { services, isLoading, createService, updateService, deleteService } = useServices()
  const { selectedChurch } = useChurch()
  const modal = useModal()
  const deleteModal = useModal()
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { viewMode, setViewMode } = useViewMode({
    storageKey: 'services-view-mode',
    defaultMode: 'list',
  })
  const getInitialFormData = () => ({
    name: '',
    type: ServiceType.SUNDAY_MORNING,
    dayOfWeek: 0,
    time: '09:00',
    isActive: true,
    churchId: selectedChurch?.id ?? '',
  })

  const [formData, setFormData] = useState(getInitialFormData())

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

  const renderHeader = (key: string, label: string) => (
    <SortableColumn key={key} sortKey={key} currentSort={sortConfig} onSort={handleSort}>
      {label}
    </SortableColumn>
  )

  function handleOpenModal(service?: Service) {
    if (service) {
      setEditingService(service)
      // Convert time from HH:mm:ss to HH:mm for input
      const timeForInput = service.time.includes(':') ? service.time.substring(0, 5) : service.time

      setFormData({
        name: service.name,
        type: service.type,
        dayOfWeek: service.dayOfWeek,
        time: timeForInput,
        isActive: service.isActive,
        churchId: service.churchId,
      })
    } else {
      setEditingService(null)
      setFormData(getInitialFormData())
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingService(null)
    setFormData(getInitialFormData())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedChurch) {
      return
    }

    try {
      // Convert time from HH:mm to HH:mm:ss format expected by backend
      const timeFormatted = formData.time.includes(':') ? `${formData.time}:00` : formData.time

      const serviceData = {
        ...formData,
        churchId: selectedChurch.id,
        time: timeFormatted,
      }

      if (editingService) {
        await updateService(editingService.id, serviceData)
      } else {
        await createService(serviceData)
      }

      handleCloseModal()
    } catch (error) {
      // Error already handled in the hook with toast
      console.error('Error submitting service form:', error)
    }
  }

  function handleDeleteClick(id: string) {
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
        // Error already handled in the hook with toast
        console.error('Error deleting service:', error)
      }
    }
  }

  const hasFilters = searchTerm !== ''

  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredServices.map(service => (
        <ServiceCard
          key={service.id}
          service={service}
          onEdit={handleOpenModal}
          onDelete={handleDeleteClick}
          isUpdating={isLoading}
          isDeleting={isLoading}
        />
      ))}
    </div>
  )

  const listViewRows = filteredServices.map(service => (
    <TableRow key={service.id}>
      <TableCell>
        <span className="font-medium">{service.name}</span>
      </TableCell>
      <TableCell>{getServiceTypeLabel(service.type)}</TableCell>
      <TableCell>{getDayLabel(service.dayOfWeek)}</TableCell>
      <TableCell>{formatTime(service.time)}</TableCell>
      <TableCell>
        <StatusBadge status={service.isActive ? 'active' : 'inactive'}>
          {service.isActive ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="action-edit" size="sm" onClick={() => handleOpenModal(service)}>
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => handleDeleteClick(service.id)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))

  return (
    <>
      <CrudPageLayout
        title="Cultos e Serviços"
        description="Configure os cultos e horários da igreja"
        createButtonLabel="Novo Culto"
        onCreateClick={() => handleOpenModal()}
        hasFilters={hasFilters}
        isEmpty={filteredServices.length === 0}
        emptyTitle={hasFilters ? 'Nenhum culto encontrado' : 'Nenhum culto cadastrado'}
        emptyDescription={
          hasFilters
            ? 'Tente ajustar os filtros para encontrar cultos'
            : 'Comece adicionando um novo culto'
        }
        createButtonIcon={<PlusIcon className="h-5 w-5 mr-2" />}
        filters={
          <CrudFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nome..."
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
                renderHeader('type', 'Tipo'),
                renderHeader('day', 'Dia da Semana'),
                renderHeader('time', 'Horário'),
                renderHeader('status', 'Status'),
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
        title={editingService ? 'Editar Culto' : 'Novo Culto'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Culto *"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Select
            label="Tipo de Culto *"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value as ServiceType })}
            options={SERVICE_TYPES.map(type => ({
              value: type.value,
              label: type.label,
            }))}
            required
          />
          <Select
            label="Dia da Semana *"
            value={formData.dayOfWeek.toString()}
            onChange={e => setFormData({ ...formData, dayOfWeek: Number.parseInt(e.target.value) })}
            options={DAYS_OF_WEEK.map(day => ({
              value: day.value.toString(),
              label: day.label,
            }))}
            required
          />
          <Input
            label="Horário *"
            type="time"
            value={formData.time}
            onChange={e => setFormData({ ...formData, time: e.target.value })}
            required
          />
          <Checkbox
            label="Culto ativo"
            checked={formData.isActive}
            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {editingService ? 'Salvar Alterações' : 'Criar Culto'}
            </Button>
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
