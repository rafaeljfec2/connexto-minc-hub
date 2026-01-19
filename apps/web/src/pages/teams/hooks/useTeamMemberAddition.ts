import { useState } from 'react'
import { Person, MemberType, TeamMemberRole } from '@minc-hub/shared/types'
import { useModal } from '@/hooks/useModal'

interface UseTeamMemberAdditionResult {
  readonly addMemberModal: ReturnType<typeof useModal>
  readonly selectedPerson: Person | null
  readonly memberType: MemberType
  readonly role: TeamMemberRole
  readonly setSelectedPerson: (person: Person | null) => void
  readonly setMemberType: (type: MemberType) => void
  readonly setRole: (role: TeamMemberRole) => void
  readonly handleAddMember: (teamId: string, onSuccess?: () => void) => Promise<void>
  readonly openModal: () => void
  readonly closeModal: () => void
}

export function useTeamMemberAddition(): UseTeamMemberAdditionResult {
  const addMemberModal = useModal()
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [memberType, setMemberType] = useState<MemberType>(MemberType.FIXED)
  const [role, setRole] = useState<TeamMemberRole>(TeamMemberRole.MEMBRO)

  const handleAddMember = async (_teamId: string, onSuccess?: () => void) => {
    // Esta função não é mais usada diretamente
    // O TeamDetailsPage agora usa o hook useTeamMembersQuery diretamente
    onSuccess?.()
  }

  const openModal = () => {
    addMemberModal.open()
  }

  const closeModal = () => {
    addMemberModal.close()
    setSelectedPerson(null)
    setMemberType(MemberType.FIXED)
    setRole(TeamMemberRole.MEMBRO)
  }

  return {
    addMemberModal,
    selectedPerson,
    memberType,
    role,
    setSelectedPerson,
    setMemberType,
    setRole,
    handleAddMember,
    openModal,
    closeModal,
  }
}
