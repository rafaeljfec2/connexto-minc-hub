import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ministry } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useChurch } from '@/contexts/ChurchContext'
import { useToast } from '@/contexts/ToastContext'

const apiServices = createApiServices(api)

type CreateMinistry = Omit<Ministry, 'id' | 'createdAt' | 'updatedAt'>

export function useMinistriesQuery() {
  const { selectedChurch } = useChurch()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const companyId = selectedChurch?.id

  // Query para listar ministérios
  const {
    data: ministries = [],
    isLoading,
    error,
  } = useQuery<Ministry[]>({
    queryKey: ['ministries', companyId],
    queryFn: () => apiServices.ministriesService.getAll(companyId!),
    enabled: !!companyId,
  })

  // Query para buscar ministério por ID
  const useGetMinistry = (id: string) => {
    return useQuery<Ministry | null>({
      queryKey: ['ministry', companyId, id],
      queryFn: () => apiServices.ministriesService.getById(id),
      enabled: !!companyId && !!id,
    })
  }

  // Mutation para criar ministério
  const createMutation = useMutation({
    mutationFn: (data: CreateMinistry) => apiServices.ministriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries', companyId] })
      showSuccess('Ministério criado com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao criar ministério')
    },
  })

  // Mutation para atualizar ministério
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Ministry> }) =>
      apiServices.ministriesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ministries', companyId] })
      queryClient.invalidateQueries({ queryKey: ['ministry', companyId, id] })
      showSuccess('Ministério atualizado com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao atualizar ministério')
    },
  })

  // Mutation para deletar ministério
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiServices.ministriesService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['ministries', companyId] })
      queryClient.removeQueries({ queryKey: ['ministry', companyId, id] })
      showSuccess('Ministério excluído com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao excluir ministério')
    },
  })

  return {
    ministries,
    isLoading,
    error,
    getMinistry: useGetMinistry,
    createMinistry: createMutation.mutate,
    updateMinistry: updateMutation.mutate,
    deleteMinistry: deleteMutation.mutate,
    createMinistryAsync: createMutation.mutateAsync,
    updateMinistryAsync: updateMutation.mutateAsync,
    deleteMinistryAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['ministries', companyId] }),
  }
}
