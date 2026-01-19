import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTeams } from '@/hooks/useTeams'
import { useMinistries } from '@/hooks/useMinistries'
import { Team } from '@minc-hub/shared/types'
import { useTeamMembers } from './teams/hooks/useTeamMembers'
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
  const { getTeamById, refresh: refreshTeams } = useTeams()
  const { ministries } = useMinistries()
  const [activeTab, setActiveTab] = useState<TabType>('membros')
  const [team, setTeam] = useState<Team | null>(null)

  const ministryName = useMemo(() => {
    if (!team?.ministryId) return null
    return ministries.find(m => m.id === team.ministryId)?.name ?? null
  }, [team?.ministryId, ministries])

  const {
    members,
    leader,
    isLoading,
    refresh: refreshMembers,
  } = useTeamMembers(team, activeTab === 'membros')

  const { memberToRemove, deleteMemberModal, handleDeleteMemberClick, handleRemoveMember, reset } =
    useTeamMemberRemoval()

  const {
    addMemberModal,
    selectedPerson,
    memberType,
    setSelectedPerson,
    setMemberType,
    handleAddMember,
    openModal,
    closeModal,
  } = useTeamMemberAddition()

  useEffect(() => {
    const loadTeam = async () => {
      if (id) {
        const data = await getTeamById(id)
        setTeam(data)
      }
    }
    loadTeam()
  }, [id, getTeamById])

  const handleRemoveMemberConfirm = async () => {
    if (!id) return
    await handleRemoveMember(id, () => {
      refreshMembers()
      refreshTeams()
      if (team) {
        setTeam({
          ...team,
          memberIds: team.memberIds.filter(memberId => memberId !== memberToRemove?.id),
        })
      }
    })
  }

  const handleAddMemberConfirm = async () => {
    if (!id) return
    await handleAddMember(id, async () => {
      await refreshMembers()
      await refreshTeams()
      // Reload team to get updated memberIds
      const updatedTeam = await getTeamById(id)
      if (updatedTeam) {
        setTeam(updatedTeam)
      }
    })
  }

  const existingMemberIds = useMemo(() => {
    return team?.memberIds ?? []
  }, [team?.memberIds])

  return (
    <>
      <div className="fixed lg:static top-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:top-auto bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-auto left-0 right-0 lg:w-full lg:max-w-7xl lg:mx-auto lg:my-8 lg:h-[calc(100vh-8rem)] flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-dark-900 lg:bg-white lg:dark:bg-dark-900 lg:rounded-2xl lg:shadow-xl lg:border lg:border-gray-200 lg:dark:border-dark-800">
        {/* Left Panel (Desktop: Sidebar / Mobile: Top) */}
        <div className="flex-shrink-0 lg:w-80 lg:border-r lg:border-gray-100 lg:dark:border-dark-800 lg:bg-gray-50/50 lg:dark:bg-dark-900/50 lg:overflow-y-auto">
          <TeamHeader onBack={() => navigate(-1)} onAddMember={openModal} />
          <TeamProfile team={team} ministryName={ministryName} />
        </div>

        {/* Right Panel (Desktop: Content / Mobile: Bottom) */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-dark-900 lg:bg-transparent relative">
          <TeamTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-32 lg:pb-8 space-y-6">
            {activeTab === 'membros' && (
              <MembersList
                team={team}
                members={members}
                leader={leader}
                isLoading={isLoading}
                onMemberDelete={handleDeleteMemberClick}
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
        onPersonChange={setSelectedPerson}
        onMemberTypeChange={setMemberType}
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
