import { useState } from 'react'
import { Person } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useModal } from '@/hooks/useModal'
import { MemberType } from '@minc-hub/shared/types'

const apiServices = createApiServices(api)

interface UseTeamMemberAdditionResult {
  readonly addMemberModal: ReturnType<typeof useModal>
  readonly selectedPerson: Person | null
  readonly memberType: MemberType
  readonly setSelectedPerson: (person: Person | null) => void
  readonly setMemberType: (type: MemberType) => void
  readonly handleAddMember: (teamId: string, onSuccess?: () => void) => Promise<void>
  readonly openModal: () => void
  readonly closeModal: () => void
}

export function useTeamMemberAddition(): UseTeamMemberAdditionResult {
  const { showSuccess, showError } = useToast()
  const addMemberModal = useModal()
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [memberType, setMemberType] = useState<MemberType>(MemberType.FIXED)

  const handleAddMember = async (teamId: string, onSuccess?: () => void) => {
    if (!selectedPerson) {
      showError('Selecione uma pessoa para adicionar')
      return
    }

    try {
      await apiServices.teamsService.addMember(teamId, {
        personId: selectedPerson.id,
        memberType: memberType as string,
      })
      showSuccess('Membro adicionado à equipe com sucesso!')
      addMemberModal.close()
      setSelectedPerson(null)
      setMemberType(MemberType.FIXED)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to add member:', error)
      const errorMessage =
        error instanceof Error && error.message.includes('already')
          ? 'Esta pessoa já é membro desta equipe'
          : 'Falha ao adicionar membro à equipe'
      showError(errorMessage)
    }
  }

  const openModal = () => {
    addMemberModal.open()
  }

  const closeModal = () => {
    addMemberModal.close()
    setSelectedPerson(null)
    setMemberType(MemberType.FIXED)
  }

  return {
    addMemberModal,
    selectedPerson,
    memberType,
    setSelectedPerson,
    setMemberType,
    handleAddMember,
    openModal,
    closeModal,
  }
}
