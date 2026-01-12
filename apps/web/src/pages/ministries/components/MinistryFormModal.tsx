import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { Textarea } from '@/components/ui/Textarea'
import { ComboBox } from '@/components/ui/ComboBox'
import { Ministry, Church } from '@minc-hub/shared/types'

interface MinistryFormModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly ministry: Ministry | null
  readonly churches: Church[]
  readonly isLoading: boolean
  readonly onSubmit: (data: Omit<Ministry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

export function MinistryFormModal({
  isOpen,
  onClose,
  ministry,
  churches,
  isLoading,
  onSubmit,
}: MinistryFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    churchId: churches[0]?.id ?? '',
    isActive: true,
  })
  useEffect(() => {
    if (ministry) {
      setFormData({
        name: ministry.name,
        description: ministry.description ?? '',
        churchId: ministry.churchId,
        isActive: ministry.isActive,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        churchId: churches[0]?.id ?? '',
        isActive: true,
      })
    }
  }, [ministry, isOpen, churches])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ministry ? 'Editar Time' : 'Novo Time'}
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
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {ministry ? 'Salvar Alterações' : 'Criar Time'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
