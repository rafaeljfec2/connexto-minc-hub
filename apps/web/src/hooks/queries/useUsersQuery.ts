import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useChurch } from '@/contexts/ChurchContext'
import { User, ApiResponse } from '@minc-hub/shared/types'
import { AxiosError } from 'axios'

const apiServices = createApiServices(api)

type CreateUser = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'canCheckIn'> & {
  password: string
  canCheckIn?: boolean
}

function extractErrorMessage(err: unknown, defaultMessage: string): string {
  if (err instanceof AxiosError && err.response) {
    const apiResponse = err.response.data as ApiResponse<unknown>
    if (apiResponse?.message) {
      return apiResponse.message
    }
  }
  return err instanceof Error ? err.message : defaultMessage
}

export function useUsersQuery() {
  const { selectedChurch } = useChurch()
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  const query = useQuery<User[], Error>({
    queryKey: ['users', selectedChurch?.id],
    queryFn: async () => {
      if (!selectedChurch?.id) {
        return []
      }
      return apiServices.usersService.getAll()
    },
    enabled: !!selectedChurch?.id,
  })

  const createMutation = useMutation<User, Error, CreateUser>({
    mutationFn: async data => {
      if (!selectedChurch?.id) {
        throw new Error('No church selected')
      }
      return apiServices.usersService.create(data)
    },
    onSuccess: newUser => {
      queryClient.setQueryData<User[]>(['users', selectedChurch?.id], old =>
        old ? [...old, newUser] : [newUser]
      )
      showSuccess('Usuário criado com sucesso!')
    },
    onError: error => {
      showError(extractErrorMessage(error, 'Falha ao criar usuário'))
    },
  })

  const updateMutation = useMutation<User, Error, { id: string; data: Partial<User> }>({
    mutationFn: async ({ id, data }) => {
      if (!selectedChurch?.id) {
        throw new Error('No church selected')
      }
      return apiServices.usersService.update(id, data)
    },
    onSuccess: (updatedUser, { id }) => {
      queryClient.setQueryData<User[]>(['users', selectedChurch?.id], old =>
        old ? old.map(user => (user.id === id ? updatedUser : user)) : [updatedUser]
      )
      showSuccess('Usuário atualizado com sucesso!')
    },
    onError: error => {
      showError(extractErrorMessage(error, 'Falha ao atualizar usuário'))
    },
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async id => {
      if (!selectedChurch?.id) {
        throw new Error('No church selected')
      }
      return apiServices.usersService.delete(id)
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData<User[]>(['users', selectedChurch?.id], old =>
        old ? old.filter(user => user.id !== id) : []
      )
      showSuccess('Usuário excluído com sucesso!')
    },
    onError: error => {
      showError(extractErrorMessage(error, 'Falha ao excluir usuário'))
    },
  })

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
