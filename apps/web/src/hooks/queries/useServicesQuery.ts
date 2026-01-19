import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Service } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useChurch } from '@/contexts/ChurchContext'
import { useToast } from '@/contexts/ToastContext'

const apiServices = createApiServices(api)

type CreateService = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>

export function useServicesQuery() {
  const { selectedChurch } = useChurch()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const companyId = selectedChurch?.id

  // Query para listar cultos
  const {
    data: services = [],
    isLoading,
    error,
  } = useQuery<Service[]>({
    queryKey: ['services', companyId],
    queryFn: () => apiServices.servicesService.getAll(companyId!),
    enabled: !!companyId,
  })

  // Query para buscar culto por ID
  const useGetService = (id: string) => {
    return useQuery<Service | null>({
      queryKey: ['service', companyId, id],
      queryFn: () => apiServices.servicesService.getById(id),
      enabled: !!companyId && !!id,
    })
  }

  // Mutation para criar culto
  const createMutation = useMutation({
    mutationFn: (data: CreateService) => apiServices.servicesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', companyId] })
      showSuccess('Culto criado com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao criar culto')
    },
  })

  // Mutation para atualizar culto
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) =>
      apiServices.servicesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['services', companyId] })
      queryClient.invalidateQueries({ queryKey: ['service', companyId, id] })
      showSuccess('Culto atualizado com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao atualizar culto')
    },
  })

  // Mutation para deletar culto
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiServices.servicesService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['services', companyId] })
      queryClient.removeQueries({ queryKey: ['service', companyId, id] })
      showSuccess('Culto excluído com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao excluir culto')
    },
  })

  return {
    services,
    isLoading,
    error,
    getService: useGetService,
    createService: createMutation.mutate,
    updateService: updateMutation.mutate,
    deleteService: deleteMutation.mutate,
    createServiceAsync: createMutation.mutateAsync,
    updateServiceAsync: updateMutation.mutateAsync,
    deleteServiceAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['services', companyId] }),
  }
}
