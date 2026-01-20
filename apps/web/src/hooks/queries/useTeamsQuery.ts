import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Team } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useChurch } from '@/contexts/ChurchContext'
import { useToast } from '@/contexts/ToastContext'
import { useMemo } from 'react'
import { useMinistriesQuery } from './useMinistriesQuery'
import {
  invalidateDependentQueries,
  invalidateTeamQueries,
  invalidateEntityQueries,
} from './utils/queryInvalidations'

const apiServices = createApiServices(api)

type CreateTeam = Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'memberIds'>

export function useTeamsQuery() {
  const { selectedChurch } = useChurch()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const companyId = selectedChurch?.id
  const { ministries } = useMinistriesQuery()

  // Get ministry IDs for the selected church
  const ministryIds = useMemo(() => {
    if (!selectedChurch) return []
    return ministries.filter(m => m.churchId === selectedChurch.id).map(m => m.id)
  }, [selectedChurch, ministries])

  // Query para listar times
  const {
    data: allTeams = [],
    isLoading,
    error,
  } = useQuery<Team[]>({
    queryKey: ['teams', companyId],
    queryFn: () => apiServices.teamsService.getAll(),
    enabled: !!companyId,
  })

  // Filtrar times por ministério da igreja selecionada
  const teams = useMemo(() => {
    return allTeams.filter(team => ministryIds.includes(team.ministryId))
  }, [allTeams, ministryIds])

  // Query para buscar time por ID
  const useGetTeam = (id: string) => {
    return useQuery<Team | null>({
      queryKey: ['team', companyId, id],
      queryFn: () => apiServices.teamsService.getById(id),
      enabled: !!companyId && !!id,
    })
  }

  // Mutation para criar time
  const createMutation = useMutation({
    mutationFn: (data: CreateTeam) => apiServices.teamsService.create(data),
    onSuccess: () => {
      invalidateEntityQueries(queryClient, 'teams', { companyId })
      invalidateDependentQueries(queryClient, 'teams')
      showSuccess('Equipe criada com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao criar equipe')
    },
  })

  // Mutation para atualizar time
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Team> }) =>
      apiServices.teamsService.update(id, data),
    onSuccess: (_, { id }) => {
      invalidateEntityQueries(queryClient, 'teams', { companyId })
      invalidateEntityQueries(queryClient, 'team', { companyId, id })
      invalidateTeamQueries(queryClient, id, { companyId })
      invalidateDependentQueries(queryClient, 'team')
      showSuccess('Equipe atualizada com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao atualizar equipe')
    },
  })

  // Mutation para deletar time
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiServices.teamsService.delete(id),
    onSuccess: (_, id) => {
      invalidateEntityQueries(queryClient, 'teams', { companyId })
      queryClient.removeQueries({ queryKey: ['team', companyId, id] })
      invalidateTeamQueries(queryClient, id, { companyId })
      invalidateDependentQueries(queryClient, 'team')
      showSuccess('Equipe excluída com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao excluir equipe')
    },
  })

  // Mutation para adicionar membro
  const addMemberMutation = useMutation({
    mutationFn: ({
      teamId,
      data,
    }: {
      teamId: string
      data: { personId: string; memberType?: string }
    }) => apiServices.teamsService.addMember(teamId, data),
    onSuccess: (_, { teamId }) => {
      invalidateTeamQueries(queryClient, teamId, { companyId })
      invalidateDependentQueries(queryClient, 'teamMembers')
      showSuccess('Membro adicionado com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao adicionar membro')
    },
  })

  // Mutation para remover membro
  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, personId }: { teamId: string; personId: string }) =>
      apiServices.teamsService.removeMember(teamId, personId),
    onSuccess: (_, { teamId }) => {
      invalidateTeamQueries(queryClient, teamId, { companyId })
      invalidateDependentQueries(queryClient, 'teamMembers')
      showSuccess('Membro removido com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao remover membro')
    },
  })

  return {
    teams,
    isLoading,
    error,
    getTeam: useGetTeam,
    createTeam: createMutation.mutate,
    updateTeam: updateMutation.mutate,
    deleteTeam: deleteMutation.mutate,
    addMember: addMemberMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    createTeamAsync: createMutation.mutateAsync,
    updateTeamAsync: updateMutation.mutateAsync,
    deleteTeamAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['teams', companyId] }),
  }
}
