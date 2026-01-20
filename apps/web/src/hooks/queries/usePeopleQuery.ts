import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Person } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useChurch } from '@/contexts/ChurchContext'
import { useToast } from '@/contexts/ToastContext'
import { invalidatePersonQueries } from './utils/queryInvalidations'

const apiServices = createApiServices(api)

type CreatePerson = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>

export function usePeopleQuery() {
  const { selectedChurch } = useChurch()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const companyId = selectedChurch?.id

  // Query para listar pessoas
  const {
    data: people = [],
    isLoading,
    error,
  } = useQuery<Person[]>({
    queryKey: ['people', companyId],
    queryFn: () => apiServices.peopleService.getAll(),
    enabled: !!companyId,
  })

  // Query para buscar pessoa por ID
  const useGetPerson = (id: string) => {
    return useQuery<Person | null>({
      queryKey: ['person', companyId, id],
      queryFn: () => apiServices.peopleService.getById(id),
      enabled: !!companyId && !!id,
    })
  }

  // Mutation para criar pessoa
  const createMutation = useMutation({
    mutationFn: (data: CreatePerson) => apiServices.peopleService.create(data),
    onSuccess: newPerson => {
      // Atualiza o cache adicionando a nova pessoa
      queryClient.setQueryData<Person[]>(['people', companyId], old =>
        old ? [...old, newPerson] : [newPerson]
      )
      // Invalidar queries relacionadas
      invalidatePersonQueries(queryClient, { companyId })
      showSuccess('Servo criado com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao criar servo')
    },
  })

  // Mutation para atualizar pessoa
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Person> }) =>
      apiServices.peopleService.update(id, data),
    onSuccess: (updatedPerson, { id }) => {
      // Atualiza o cache substituindo a pessoa atualizada
      queryClient.setQueryData<Person[]>(['people', companyId], old =>
        old ? old.map(p => (p.id === id ? updatedPerson : p)) : [updatedPerson]
      )
      queryClient.setQueryData(['person', companyId, id], updatedPerson)
      // Invalidar queries relacionadas
      invalidatePersonQueries(queryClient, { companyId, personId: id })
      showSuccess('Servo atualizado com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao atualizar servo')
    },
  })

  // Mutation para deletar pessoa
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiServices.peopleService.delete(id),
    onSuccess: (_, id) => {
      // Remove a pessoa do cache
      queryClient.setQueryData<Person[]>(['people', companyId], old =>
        old ? old.filter(p => p.id !== id) : []
      )
      queryClient.removeQueries({ queryKey: ['person', companyId, id] })
      // Invalidar queries relacionadas
      invalidatePersonQueries(queryClient, { companyId, personId: id })
      showSuccess('Servo excluído com sucesso!')
    },
    onError: (error: Error) => {
      showError(error.message || 'Falha ao excluir servo')
    },
  })

  return {
    people,
    isLoading,
    error,
    getPerson: useGetPerson,
    createPerson: createMutation.mutate,
    updatePerson: updateMutation.mutate,
    deletePerson: deleteMutation.mutate,
    createPersonAsync: createMutation.mutateAsync,
    updatePersonAsync: updateMutation.mutateAsync,
    deletePersonAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['people', companyId] }),
  }
}
