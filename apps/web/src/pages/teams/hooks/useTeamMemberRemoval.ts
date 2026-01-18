import { useState } from 'react'
import { Person } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useModal } from '@/hooks/useModal'

const apiServices = createApiServices(api)

interface UseTeamMemberRemovalResult {
  readonly memberToRemove: Person | null
  readonly deleteMemberModal: ReturnType<typeof useModal>
  readonly handleDeleteMemberClick: (member: Person) => void
  readonly handleRemoveMember: (teamId: string, onSuccess?: () => void) => Promise<void>
  readonly reset: () => void
}

export function useTeamMemberRemoval(): UseTeamMemberRemovalResult {
  const { showSuccess, showError } = useToast()
  const deleteMemberModal = useModal()
  const [memberToRemove, setMemberToRemove] = useState<Person | null>(null)

  const handleDeleteMemberClick = (member: Person) => {
    setMemberToRemove(member)
    deleteMemberModal.open()
  }

  const handleRemoveMember = async (teamId: string, onSuccess?: () => void) => {
    if (!memberToRemove) return

    try {
      await apiServices.teamsService.removeMember(teamId, memberToRemove.id)
      showSuccess('Membro removido da equipe com sucesso!')
      deleteMemberModal.close()
      setMemberToRemove(null)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to remove member:', error)
      showError('Falha ao remover membro da equipe')
    }
  }

  const reset = () => {
    deleteMemberModal.close()
    setMemberToRemove(null)
  }

  return {
    memberToRemove,
    deleteMemberModal,
    handleDeleteMemberClick,
    handleRemoveMember,
    reset,
  }
}
