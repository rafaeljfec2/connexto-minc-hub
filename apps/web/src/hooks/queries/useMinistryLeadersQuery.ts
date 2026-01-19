import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

const apiServices = createApiServices(api)

export function useMinistryLeadersQuery(ministryId: string | null) {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  const query = useQuery({
    queryKey: ['ministryLeaders', ministryId],
    queryFn: async () => {
      if (!ministryId) return []
      const leaders = await apiServices.ministriesService.getLeaders(ministryId)
      return leaders
    },
    enabled: !!ministryId,
  })

  const addLeaderMutation = useMutation({
    mutationFn: async (personId: string) => {
      if (!ministryId) throw new Error('Ministry ID is required')
      return apiServices.ministriesService.addLeader(ministryId, personId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministryLeaders', ministryId] })
      queryClient.invalidateQueries({ queryKey: ['ministries'] })
      showSuccess('Líder adicionado com sucesso')
    },
    onError: (error: Error) => {
      showError(error.message || 'Erro ao adicionar líder')
    },
  })

  const removeLeaderMutation = useMutation({
    mutationFn: async (personId: string) => {
      if (!ministryId) throw new Error('Ministry ID is required')
      return apiServices.ministriesService.removeLeader(ministryId, personId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministryLeaders', ministryId] })
      queryClient.invalidateQueries({ queryKey: ['ministries'] })
      showSuccess('Líder removido com sucesso')
    },
    onError: (error: Error) => {
      showError(error.message || 'Erro ao remover líder')
    },
  })

  return {
    leaders: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addLeader: addLeaderMutation.mutate,
    removeLeader: removeLeaderMutation.mutate,
    isAddingLeader: addLeaderMutation.isPending,
    isRemovingLeader: removeLeaderMutation.isPending,
  }
}
