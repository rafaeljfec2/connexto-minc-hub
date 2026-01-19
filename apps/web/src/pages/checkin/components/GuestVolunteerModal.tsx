import { useState, useMemo, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ComboBox, ComboBoxOption } from '@/components/ui/ComboBox'
import { usePeople } from '@/hooks/usePeople'
import { useAuth } from '@/contexts/AuthContext'

interface GuestVolunteerModalProps {
  isOpen: boolean
  onClose: () => void
  scheduleId: string
  onAdd: (personId: string) => Promise<void>
  existingPersonIds: string[]
}

export function GuestVolunteerModal({
  isOpen,
  onClose,
  scheduleId: _scheduleId,
  onAdd,
  existingPersonIds,
}: Readonly<GuestVolunteerModalProps>) {
  const { user } = useAuth()
  const { people, fetchPeople } = usePeople()
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [hasFetchedForModal, setHasFetchedForModal] = useState(false)

  useEffect(() => {
    if (isOpen && !hasFetchedForModal) {
      setHasFetchedForModal(true)
      void fetchPeople()
        .then(() => {
          // Success - flag remains true
        })
        .catch(() => {
          // Error already handled in hook - reset flag so it can retry next time modal opens
          setHasFetchedForModal(false)
        })
    }

    if (!isOpen) {
      setSelectedPersonId(null)
      setHasFetchedForModal(false)
    }
  }, [isOpen, hasFetchedForModal, fetchPeople])

  // Filter people: same ministry, not already in schedule or guest volunteers
  const availablePeople = useMemo(() => {
    if (!user?.personId) return []

    // Get current user person to find their ministry
    const currentPerson = people.find(p => p.id === user.personId)
    if (!currentPerson?.ministryId) return []

    return people.filter(person => {
      // Same ministry
      if (person.ministryId !== currentPerson.ministryId) return false
      // Not the current user
      if (person.id === user.personId) return false
      // Not already in schedule or guest volunteers
      if (existingPersonIds.includes(person.id)) return false
      return true
    })
  }, [people, user, existingPersonIds])

  const personOptions: ComboBoxOption<string>[] = useMemo(
    () =>
      availablePeople.map(person => ({
        value: person.id,
        label: person.name,
      })),
    [availablePeople]
  )

  const handleAdd = async () => {
    if (!selectedPersonId) return

    setIsAdding(true)
    try {
      await onAdd(selectedPersonId)
      setSelectedPersonId(null)
      onClose()
    } catch {
      // Error is handled by the hook - intentionally empty catch
    } finally {
      setIsAdding(false)
    }
  }

  const renderPersonItem = (option: ComboBoxOption<string>) => {
    const person = availablePeople.find(p => p.id === option.value)
    if (!person) return <span>{option.label}</span>

    return (
      <div className="flex flex-col">
        <span className="font-medium leading-tight text-sm">{person.name}</span>
        {person.phone && (
          <span className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">{person.phone}</span>
        )}
      </div>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Voluntário Avulso">
      <div className="space-y-4">
        <p className="text-sm text-dark-600 dark:text-dark-400">
          Selecione uma pessoa do seu ministério para adicionar como voluntário avulso nesta escala.
        </p>

        <div>
          <label
            htmlFor="volunteer-select"
            className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2"
          >
            Voluntário
          </label>
          <ComboBox
            options={personOptions}
            value={selectedPersonId}
            onValueChange={setSelectedPersonId}
            placeholder={
              availablePeople.length > 0 ? 'Selecione uma pessoa...' : 'Nenhuma pessoa disponível'
            }
            searchable
            searchPlaceholder="Buscar pessoa..."
            renderItem={renderPersonItem}
            className="w-full"
            disabled={availablePeople.length === 0}
          />
          {availablePeople.length === 0 && (
            <p className="text-xs text-dark-500 dark:text-dark-400 mt-2">
              Não há pessoas disponíveis no seu ministério para adicionar como voluntário avulso.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={isAdding}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} disabled={!selectedPersonId || isAdding} isLoading={isAdding}>
            Adicionar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
