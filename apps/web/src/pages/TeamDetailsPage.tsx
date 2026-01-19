import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Person, TeamMemberRole } from '@minc-hub/shared/types'
import { useTeamByIdQuery } from '@/hooks/queries/useTeamByIdQuery'
import { useMinistriesQuery } from '@/hooks/queries/useMinistriesQuery'
import { useTeamMembersQuery } from '@/hooks/queries/useTeamMembersQuery'
import { useTeamMemberRemoval } from './teams/hooks/useTeamMemberRemoval'
import { useTeamMemberAddition } from './teams/hooks/useTeamMemberAddition'
import { TeamHeader } from './teams/components/TeamHeader'
import { TeamProfile } from './teams/components/TeamProfile'
import { TeamTabs } from './teams/components/TeamTabs'
import { MembersList } from './teams/components/MembersList'
import { AddMemberModal } from './teams/components/AddMemberModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

type TabType = 'membros' | 'tarefas' | 'atividades'

export default function TeamDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: team } = useTeamByIdQuery(id)
  const { ministries } = useMinistriesQuery()
  const [activeTab, setActiveTab] = useState<TabType>('membros')

  const ministryName = useMemo(() => {
    if (!team?.ministryId) return null
    return ministries.find(m => m.id === team.ministryId)?.name ?? null
  }, [team?.ministryId, ministries])

  const {
    members: teamMembersData,
    isLoading: isLoadingMembers,
    addMember: addMemberMutation,
    updateMemberRole: updateMemberRoleMutation,
    removeMember: removeMemberMutation,
  } = useTeamMembersQuery(team?.id ?? null)

  // Separar membros e líderes e ordenar por nome
  const members = useMemo(() => {
    return teamMembersData
      .map(tm => tm.person)
      .filter((p): p is Person => p !== undefined && p !== null)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
  }, [teamMembersData])

  const leaders = useMemo(() => {
    return teamMembersData
      .filter(tm => tm.role === 'lider_de_equipe')
      .map(tm => tm.person)
      .filter((p): p is Person => p !== undefined && p !== null)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
  }, [teamMembersData])

  const { memberToRemove, deleteMemberModal, handleDeleteMemberClick, reset } =
    useTeamMemberRemoval()

  const {
    addMemberModal,
    selectedPerson,
    memberType,
    role,
    setSelectedPerson,
    setMemberType,
    setRole,
    openModal,
    closeModal,
  } = useTeamMemberAddition()

  // Team is now loaded automatically by useTeamByIdQuery
  // No need for manual loading

  // Abrir modal de adicionar membro se vier da navegação com estado
  useEffect(() => {
    const state = location.state as { openAddMemberModal?: boolean } | null
    if (state?.openAddMemberModal) {
      openModal()
      // Limpar o estado para não abrir novamente ao navegar
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate, openModal])

  const handleRemoveMemberConfirm = async () => {
    if (!id || !memberToRemove) return
    removeMemberMutation(memberToRemove.id)
    reset()
  }

  const handleAddMemberConfirm = async () => {
    if (!id || !selectedPerson) return
    addMemberMutation({
      personId: selectedPerson.id,
      memberType: memberType as string,
      role,
    })
    closeModal()
  }

  const handlePromoteMember = (member: Person) => {
    if (!id) return
    updateMemberRoleMutation({
      personId: member.id,
      role: TeamMemberRole.LIDER_DE_EQUIPE,
    })
  }

  const handleDemoteMember = (member: Person) => {
    if (!id) return
    updateMemberRoleMutation({
      personId: member.id,
      role: TeamMemberRole.MEMBRO,
    })
  }

  const existingMemberIds = useMemo(() => {
    return team?.memberIds ?? []
  }, [team?.memberIds])

  return (
    <>
      <div className="fixed lg:static top-0 lg:top-auto bottom-0 lg:bottom-auto left-0 right-0 lg:w-full lg:max-w-7xl lg:mx-auto lg:my-8 lg:h-[calc(100vh-8rem)] flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-dark-900 lg:bg-white lg:dark:bg-dark-900 lg:rounded-2xl lg:shadow-xl lg:border lg:border-gray-200 lg:dark:border-dark-800 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:pt-0 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        {/* Left Panel (Desktop: Sidebar / Mobile: Top) */}
        <div className="flex-shrink-0 lg:w-80 lg:border-r lg:border-gray-100 lg:dark:border-dark-800 lg:bg-gray-50/50 lg:dark:bg-dark-900/50 lg:overflow-y-auto">
          <TeamHeader onBack={() => navigate(-1)} onAddMember={openModal} />
          <TeamProfile team={team ?? null} ministryName={ministryName} />
        </div>

        {/* Right Panel (Desktop: Content / Mobile: Bottom) */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-dark-900 lg:bg-transparent relative">
          <TeamTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-32 lg:pb-8 space-y-6">
            {activeTab === 'membros' && (
              <MembersList
                members={members}
                leaders={leaders}
                isLoading={isLoadingMembers}
                onMemberDelete={handleDeleteMemberClick}
                onPromoteMember={handlePromoteMember}
                onDemoteMember={handleDemoteMember}
                onAddMember={openModal}
              />
            )}
          </div>
        </div>
      </div>

      <AddMemberModal
        isOpen={addMemberModal.isOpen}
        onClose={closeModal}
        onSubmit={handleAddMemberConfirm}
        selectedPerson={selectedPerson}
        memberType={memberType}
        role={role}
        onPersonChange={setSelectedPerson}
        onMemberTypeChange={setMemberType}
        onRoleChange={setRole}
        existingMemberIds={existingMemberIds}
      />

      <ConfirmDialog
        isOpen={deleteMemberModal.isOpen}
        onClose={reset}
        onConfirm={handleRemoveMemberConfirm}
        title="Remover Membro"
        message={`Tem certeza que deseja remover ${memberToRemove?.name} desta equipe?`}
        confirmText="Remover"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  )
}
