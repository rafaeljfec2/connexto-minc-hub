import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { TeamMemberRole } from '@minc-hub/shared/types'
import { useToast } from '@/contexts/ToastContext'
import { invalidateDependentQueries } from './utils/queryInvalidations'

const apiServices = createApiServices(api)

export function useTeamMembersQuery(teamId: string | null) {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  const query = useQuery({
    queryKey: ['teamMembers', teamId],
    queryFn: async () => {
      if (!teamId) return []
      const members = await apiServices.teamsService.getMembers(teamId)
      return members
    },
    enabled: !!teamId,
  })

  const addMemberMutation = useMutation({
    mutationFn: async (data: { personId: string; memberType?: string; role?: TeamMemberRole }) => {
      if (!teamId) throw new Error('Team ID is required')
      return apiServices.teamsService.addMember(teamId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', teamId] })
      invalidateDependentQueries(queryClient, 'teamMembers')
      showSuccess('Membro adicionado com sucesso')
    },
    onError: (error: Error) => {
      showError(error.message || 'Erro ao adicionar membro')
    },
  })

  const updateMemberRoleMutation = useMutation({
    mutationFn: async (data: { personId: string; memberType?: string; role?: TeamMemberRole }) => {
      if (!teamId) throw new Error('Team ID is required')
      return apiServices.teamsService.updateMemberRole(teamId, data.personId, {
        memberType: data.memberType,
        role: data.role,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', teamId] })
      invalidateDependentQueries(queryClient, 'teamMembers')
      showSuccess('Função do membro atualizada com sucesso')
    },
    onError: (error: Error) => {
      showError(error.message || 'Erro ao atualizar função do membro')
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: async (personId: string) => {
      if (!teamId) throw new Error('Team ID is required')
      return apiServices.teamsService.removeMember(teamId, personId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', teamId] })
      invalidateDependentQueries(queryClient, 'teamMembers')
      showSuccess('Membro removido com sucesso')
    },
    onError: (error: Error) => {
      showError(error.message || 'Erro ao remover membro')
    },
  })

  return {
    members: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addMember: addMemberMutation.mutate,
    updateMemberRole: updateMemberRoleMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    isAddingMember: addMemberMutation.isPending,
    isUpdatingRole: updateMemberRoleMutation.isPending,
    isRemovingMember: removeMemberMutation.isPending,
  }
}
