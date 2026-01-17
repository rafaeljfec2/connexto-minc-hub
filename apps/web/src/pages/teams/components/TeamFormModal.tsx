import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { ComboBox } from '@/components/ui/ComboBox'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import type { Church, Ministry, Team } from '@minc-hub/shared/types'

interface TeamFormData {
  name: string
  description: string
  churchId: string
  ministryId: string
  isActive: boolean
}

interface TeamFormModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onSubmit: (e: React.FormEvent) => void
  readonly editingTeam: Team | null
  readonly formData: TeamFormData
  readonly onFormDataChange: (data: TeamFormData) => void
  readonly churches: Church[]
  readonly ministries: Ministry[]
  readonly selectedChurch: Church | null
}

export function TeamFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingTeam,
  formData,
  onFormDataChange,
  churches,
  ministries,
  selectedChurch,
}: TeamFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTeam ? 'Editar Equipe' : 'Nova Equipe'}
      size="lg"
    >
      <form onSubmit={onSubmit} className="flex flex-col h-full">
        <div className="space-y-4 overflow-y-auto overscroll-contain max-h-[calc(65vh-8rem)]">
          <Select
            label="Igreja *"
            value={selectedChurch?.id ?? ''}
            onChange={() => {
              // Church is controlled by header selector
            }}
            options={churches.map(church => ({
              value: church.id,
              label: church.name,
            }))}
            required
            disabled
          />
          <ComboBox
            label="Time *"
            value={formData.ministryId || null}
            onValueChange={val => onFormDataChange({ ...formData, ministryId: val || '' })}
            options={ministries.map(ministry => ({
              value: ministry.id,
              label: ministry.name,
            }))}
            placeholder="Selecione um time"
            searchable
            searchPlaceholder="Buscar time..."
            disabled={!selectedChurch || ministries.length === 0}
          />
          <Input
            label="Nome da Equipe *"
            value={formData.name}
            onChange={e => onFormDataChange({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label="Descrição"
            value={formData.description}
            onChange={e => onFormDataChange({ ...formData, description: e.target.value })}
            placeholder="Descrição da equipe..."
            rows={4}
          />
          <Checkbox
            label="Equipe ativa"
            checked={formData.isActive}
            onChange={e => onFormDataChange({ ...formData, isActive: e.target.checked })}
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-6 border-t border-dark-200 dark:border-dark-800 mt-6 flex-shrink-0 pb-2">
          <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            {editingTeam ? 'Salvar Alterações' : 'Criar Equipe'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
