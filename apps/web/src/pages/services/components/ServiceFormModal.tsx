import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Service, ServiceType } from '@minc-hub/shared/types'
import { DAYS_OF_WEEK, SERVICE_TYPES } from '@/lib/constants'

interface ServiceFormModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly service: Service | null
  readonly isLoading: boolean
  readonly onSubmit: (
    data: Omit<Service, 'id' | 'churchId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>
}

export function ServiceFormModal({
  isOpen,
  onClose,
  service,
  isLoading,
  onSubmit,
}: ServiceFormModalProps) {
  const getInitialFormData = () => ({
    name: '',
    type: ServiceType.SUNDAY_MORNING,
    dayOfWeek: 0,
    time: '09:00',
    isActive: true,
  })

  const [formData, setFormData] = useState(getInitialFormData())

  useEffect(() => {
    if (service) {
      // Convert time from HH:mm:ss to HH:mm for input
      const timeForInput = service.time.includes(':') ? service.time.substring(0, 5) : service.time

      setFormData({
        name: service.name,
        type: service.type,
        dayOfWeek: service.dayOfWeek,
        time: timeForInput,
        isActive: service.isActive,
      })
    } else {
      setFormData(getInitialFormData())
    }
  }, [service, isOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Convert time from HH:mm to HH:mm:ss format expected by backend
    const timeFormatted = formData.time.includes(':') ? `${formData.time}:00` : formData.time

    await onSubmit({
      ...formData,
      time: timeFormatted,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? 'Editar Culto' : 'Novo Culto'}
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
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {service ? 'Salvar Alterações' : 'Criar Culto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
