import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageWithCrud } from '@/components/pages/PageWithCrud'
import { useModal } from '@/hooks/useModal'
import { useCrud } from '@/hooks/useCrud'
import { Service, ServiceType } from '@/types'
import { formatTime } from '@/lib/utils'
import { DAYS_OF_WEEK, SERVICE_TYPES, getDayLabel, getServiceTypeLabel } from '@/lib/constants'

const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    churchId: '1',
    type: ServiceType.SUNDAY_MORNING,
    dayOfWeek: 0,
    time: '09:00',
    name: 'Culto Dominical Manhã',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    churchId: '1',
    type: ServiceType.SUNDAY_EVENING,
    dayOfWeek: 0,
    time: '19:00',
    name: 'Culto Dominical Noite',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    churchId: '1',
    type: ServiceType.WEDNESDAY,
    dayOfWeek: 3,
    time: '19:30',
    name: 'Culto de Oração',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function ServicesPage() {
  const { items: services, create, update, remove } = useCrud<Service>({
    initialItems: MOCK_SERVICES,
  })
  const modal = useModal()
  const deleteModal = useModal()
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: ServiceType.SUNDAY_MORNING,
    dayOfWeek: 0,
    time: '09:00',
    isActive: true,
  })

  function handleOpenModal(service?: Service) {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        type: service.type,
        dayOfWeek: service.dayOfWeek,
        time: service.time,
        isActive: service.isActive,
      })
    } else {
      setEditingService(null)
      setFormData({
        name: '',
        type: ServiceType.SUNDAY_MORNING,
        dayOfWeek: 0,
        time: '09:00',
        isActive: true,
      })
    }
    modal.open()
  }

  function handleCloseModal() {
    modal.close()
    setEditingService(null)
    setFormData({
      name: '',
      type: ServiceType.SUNDAY_MORNING,
      dayOfWeek: 0,
      time: '09:00',
      isActive: true,
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (editingService) {
      update(editingService.id, formData)
    } else {
      create({ ...formData, churchId: '1' })
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
      render: (service: Service) => <span className="font-medium">{service.name}</span>,
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (service: Service) => getServiceTypeLabel(service.type),
    },
    {
      key: 'dayOfWeek',
      label: 'Dia da Semana',
      render: (service: Service) => getDayLabel(service.dayOfWeek),
    },
    {
      key: 'time',
      label: 'Horário',
      render: (service: Service) => formatTime(service.time),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (service: Service) => (
        <StatusBadge status={service.isActive ? 'active' : 'inactive'}>
          {service.isActive ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      ),
    },
  ]

  return (
    <>
      <PageWithCrud
        title="Cultos e Serviços"
        description="Configure os cultos e horários da igreja"
        createButtonLabel="Novo Culto"
        items={services}
        searchFields={['name']}
        searchPlaceholder="Buscar por nome..."
        emptyMessage="Nenhum culto cadastrado"
        emptySearchMessage="Nenhum culto encontrado"
        tableContent={(paginatedItems) => (
          <DataTable
            data={paginatedItems}
            columns={columns}
            hasSearch={false}
            actions={(service) => (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenModal(service)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(service.id)}
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
        title={editingService ? 'Editar Culto' : 'Novo Culto'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Culto *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Select
            label="Tipo de Culto *"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as ServiceType })}
            options={SERVICE_TYPES.map((type) => ({
              value: type.value,
              label: type.label,
            }))}
            required
          />
          <Select
            label="Dia da Semana *"
            value={formData.dayOfWeek.toString()}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
            options={DAYS_OF_WEEK.map((day) => ({
              value: day.value.toString(),
              label: day.label,
            }))}
            required
          />
          <Input
            label="Horário *"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
          <Checkbox
            label="Culto ativo"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
              {editingService ? 'Salvar Alterações' : 'Criar Culto'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteConfirm}
        title="Excluir Culto"
        message="Tem certeza que deseja excluir este culto? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  )
}
