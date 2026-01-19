import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Schedule } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useChurch } from '@/contexts/ChurchContext'
import { useToast } from '@/contexts/ToastContext'

const apiServices = createApiServices(api)

type CreateSchedule = Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>

export function useSchedulesQuery(serviceId?: string, startDate?: string, endDate?: string) {
  const { selectedChurch } = useChurch()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const companyId = selectedChurch?.id

  // Query para listar escalas
  const {
    data: schedules = [],
    isLoading,
    error,
  } = useQuery<Schedule[]>({
    queryKey: ['schedules', companyId, serviceId ?? null, startDate ?? null, endDate ?? null],
    queryFn: () => apiServices.schedulesService.getAll(serviceId, startDate, endDate),
    enabled: !!companyId,
  })

  // Query para buscar escala por ID
  const useGetSchedule = (id: string) => {
    return useQuery<Schedule | null>({
      queryKey: ['schedule', companyId, id],
      queryFn: () => apiServices.schedulesService.getById(id),
      enabled: !!companyId && !!id,
    })
  }

  // Mutation para criar escala
  const createMutation = useMutation({
    mutationFn: (data: CreateSchedule) => apiServices.schedulesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', companyId] })
      showSuccess('Escala criada com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao criar escala')
    },
  })

  // Mutation para atualizar escala
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Schedule> }) =>
      apiServices.schedulesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['schedules', companyId] })
      queryClient.invalidateQueries({ queryKey: ['schedule', companyId, id] })
      showSuccess('Escala atualizada com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao atualizar escala')
    },
  })

  // Mutation para deletar escala
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiServices.schedulesService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['schedules', companyId] })
      queryClient.removeQueries({ queryKey: ['schedule', companyId, id] })
      showSuccess('Escala excluída com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao excluir escala')
    },
  })

  return {
    schedules,
    isLoading,
    error,
    getSchedule: useGetSchedule,
    createSchedule: createMutation.mutate,
    updateSchedule: updateMutation.mutate,
    deleteSchedule: deleteMutation.mutate,
    createScheduleAsync: createMutation.mutateAsync,
    updateScheduleAsync: updateMutation.mutateAsync,
    deleteScheduleAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['schedules', companyId] }),
  }
}
