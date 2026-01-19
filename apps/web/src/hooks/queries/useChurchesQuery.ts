import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Church } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'

const apiServices = createApiServices(api)

type CreateChurch = Omit<Church, 'id' | 'createdAt' | 'updatedAt'>

export function useChurchesQuery() {
  const { showSuccess, showError } = useToast()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  // Query para listar igrejas
  const {
    data: churches = [],
    isLoading,
    error,
  } = useQuery<Church[]>({
    queryKey: ['churches'],
    queryFn: () => apiServices.churchesService.getAll(),
    enabled: isAuthenticated, // Só busca se estiver autenticado
  })

  // Query para buscar igreja por ID
  const useGetChurch = (id: string) => {
    return useQuery<Church | null>({
      queryKey: ['church', id],
      queryFn: () => apiServices.churchesService.getById(id),
      enabled: !!id,
    })
  }

  // Mutation para criar igreja
  const createMutation = useMutation({
    mutationFn: (data: CreateChurch) => apiServices.churchesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['churches'] })
      showSuccess('Igreja criada com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao criar igreja')
    },
  })

  // Mutation para atualizar igreja
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Church> }) =>
      apiServices.churchesService.update(id, data),
    onSuccess: (updatedChurch, { id }) => {
      // Atualiza o cache substituindo a igreja atualizada
      queryClient.setQueryData<Church[]>(['churches'], old =>
        old ? old.map(c => (c.id === id ? updatedChurch : c)) : [updatedChurch]
      )
      queryClient.setQueryData(['church', id], updatedChurch)
      showSuccess('Igreja atualizada com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao atualizar igreja')
    },
  })

  // Mutation para deletar igreja
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiServices.churchesService.delete(id),
    onSuccess: (_, id) => {
      // Remove a igreja do cache
      queryClient.setQueryData<Church[]>(['churches'], old =>
        old ? old.filter(c => c.id !== id) : []
      )
      queryClient.removeQueries({ queryKey: ['church', id] })
      showSuccess('Igreja excluída com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao excluir igreja')
    },
  })

  return {
    churches,
    isLoading,
    error,
    getChurch: useGetChurch,
    createChurch: createMutation.mutate,
    updateChurch: updateMutation.mutate,
    deleteChurch: deleteMutation.mutate,
    createChurchAsync: createMutation.mutateAsync,
    updateChurchAsync: updateMutation.mutateAsync,
    deleteChurchAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['churches'] }),
  }
}
