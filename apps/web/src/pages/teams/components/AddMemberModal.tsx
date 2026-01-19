import { useMemo } from 'react'
import { Person, MemberType } from '@minc-hub/shared/types'
import { Modal } from '@/components/ui/Modal'
import { ComboBox, type ComboBoxOption } from '@/components/ui/ComboBox'
import { Button } from '@/components/ui/Button'
import { usePeople } from '@/hooks/usePeople'

interface AddMemberModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onSubmit: () => void
  readonly selectedPerson: Person | null
  readonly memberType: MemberType
  readonly onPersonChange: (person: Person | null) => void
  readonly onMemberTypeChange: (type: MemberType) => void
  readonly existingMemberIds: string[]
}

export function AddMemberModal({
  isOpen,
  onClose,
  onSubmit,
  selectedPerson,
  memberType,
  onPersonChange,
  onMemberTypeChange,
  existingMemberIds,
}: AddMemberModalProps) {
  const { people } = usePeople()

  // Filter out people who are already members
  const availablePeople = useMemo(() => {
    return people.filter(person => !existingMemberIds.includes(person.id))
  }, [people, existingMemberIds])

  const personOptions: ComboBoxOption<string>[] = useMemo(() => {
    return availablePeople.map(person => ({
      value: person.id,
      label: person.name,
    }))
  }, [availablePeople])

  const memberTypeOptions: ComboBoxOption<MemberType>[] = [
    { value: MemberType.FIXED, label: 'Fixo' },
    { value: MemberType.EVENTUAL, label: 'Eventual' },
  ]

  const handlePersonSelect = (personId: string | null) => {
    const person = personId ? availablePeople.find(p => p.id === personId) : null
    onPersonChange(person ?? null)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Membro" size="md">
      <div className="space-y-4">
        <ComboBox
          label="Pessoa *"
          value={selectedPerson?.id ?? null}
          onValueChange={handlePersonSelect}
          options={personOptions}
          placeholder="Selecione uma pessoa"
          searchable
          searchPlaceholder="Buscar pessoa..."
        />

        <ComboBox
          label="Tipo de Membro"
          value={memberType}
          onValueChange={value => onMemberTypeChange(value as MemberType)}
          options={memberTypeOptions}
          placeholder="Selecione o tipo"
        />

        {availablePeople.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            Todas as pessoas já são membros desta equipe.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={onSubmit} disabled={!selectedPerson}>
            Adicionar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
