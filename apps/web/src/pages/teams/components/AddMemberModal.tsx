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
      <div className="flex flex-col h-full sm:-m-6">
        <div className="sm:px-6 space-y-4 overflow-y-auto overscroll-contain sm:flex-1 sm:min-h-0">
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
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-dark-200 dark:border-dark-800 mt-4 sm:px-6 sm:pb-6 sm:pt-6 sm:mt-6 sm:flex-shrink-0 sm:bg-white sm:dark:bg-dark-900">
          <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onSubmit}
            disabled={!selectedPerson}
            className="w-full sm:w-auto"
          >
            Adicionar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
