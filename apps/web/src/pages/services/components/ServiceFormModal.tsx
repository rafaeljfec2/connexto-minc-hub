import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ComboBox } from '@/components/ui/ComboBox'
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
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="space-y-4 overflow-y-auto overscroll-contain max-h-[calc(75vh-12rem)]">
          <Input
            label="Nome do Culto *"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Tipo de Culto *
            </label>
            <ComboBox
              options={SERVICE_TYPES.map(type => ({
                value: type.value,
                label: type.label,
              }))}
              value={formData.type}
              onValueChange={value =>
                setFormData({
                  ...formData,
                  type: (value as ServiceType) ?? ServiceType.SUNDAY_MORNING,
                })
              }
              placeholder="Selecione o tipo de culto"
              searchable
              searchPlaceholder="Buscar tipo..."
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Dia da Semana *
            </label>
            <ComboBox
              options={DAYS_OF_WEEK.map(day => ({
                value: day.value.toString(),
                label: day.label,
              }))}
              value={formData.dayOfWeek.toString()}
              onValueChange={value =>
                setFormData({ ...formData, dayOfWeek: Number.parseInt(value ?? '0') })
              }
              placeholder="Selecione o dia da semana"
              searchable
              searchPlaceholder="Buscar dia..."
              className="w-full"
            />
          </div>
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
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-dark-200 dark:border-dark-800 mt-4 flex-shrink-0 pb-safe">
          <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {service ? 'Salvar Alterações' : 'Criar Culto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
