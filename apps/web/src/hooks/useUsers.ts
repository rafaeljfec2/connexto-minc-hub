import { useState, useCallback, useEffect, useRef } from 'react'
import { User, ApiResponse } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { AxiosError } from 'axios'
import { getCachedFetch } from './utils/fetchCache'

type CreateUser = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'canCheckIn'> & { password: string }

interface UseUsersReturn {
  users: User[]
  isLoading: boolean
  error: Error | null
  fetchUsers: () => Promise<void>
  getUserById: (id: string) => Promise<User | null>
  createUser: (data: CreateUser) => Promise<User>
  updateUser: (id: string, data: Partial<User>) => Promise<User>
  deleteUser: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const apiServices = createApiServices(api)

function extractErrorMessage(err: unknown, defaultMessage: string): string {
  if (err instanceof AxiosError && err.response) {
    const apiResponse = err.response.data as ApiResponse<unknown>
    if (apiResponse && apiResponse.message) {
      return apiResponse.message
    }
  }
  return err instanceof Error ? err.message : defaultMessage
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { showSuccess, showError } = useToast()
  const hasFetchedRef = useRef<boolean>(false)

  const fetchUsers = useCallback(async (): Promise<void> => {
    const cacheKey = 'users-all'

    try {
      setIsLoading(true)
      setError(null)

      const data = await getCachedFetch(cacheKey, async () => {
        const fetchedData = await apiServices.usersService.getAll()
        return fetchedData
      })

      // Always update state with the data, whether from cache or new fetch
      if (data && Array.isArray(data)) {
        setUsers(data)
      } else {
        setUsers([])
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch users')
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getUserById = useCallback(async (id: string): Promise<User | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const user = await apiServices.usersService.getById(id)
      return user ?? null
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createUser = useCallback(
    async (data: CreateUser): Promise<User> => {
      try {
        setIsLoading(true)
        setError(null)
        const newUser = await apiServices.usersService.create(data)
        setUsers(prev => [...prev, newUser])
        showSuccess('Usuário criado com sucesso!')
        return newUser
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao criar usuário')
        const error = new Error(errorMessage)
        setError(error)
        showError(errorMessage)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [showSuccess, showError]
  )

  const updateUser = useCallback(
    async (id: string, data: Partial<User>): Promise<User> => {
      try {
        setIsLoading(true)
        setError(null)
        const updatedUser = await apiServices.usersService.update(id, data)
        setUsers(prev => prev.map(user => (user.id === id ? updatedUser : user)))
        showSuccess('Usuário atualizado com sucesso!')
        return updatedUser
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao atualizar usuário')
        const error = new Error(errorMessage)
        setError(error)
        showError(errorMessage)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [showSuccess, showError]
  )

  const deleteUser = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        await apiServices.usersService.delete(id)
        setUsers(prev => prev.filter(user => user.id !== id))
        showSuccess('Usuário excluído com sucesso!')
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao excluir usuário')
        const error = new Error(errorMessage)
        setError(error)
        showError(errorMessage)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [showSuccess, showError]
  )

  const refresh = useCallback(async () => {
    await fetchUsers()
  }, [fetchUsers])

  // Auto-fetch on mount (only once)
  useEffect(() => {
    // Prevent duplicate calls
    if (hasFetchedRef.current) {
      return
    }

    hasFetchedRef.current = true
    fetchUsers().catch(() => {
      // Error already handled in fetchUsers
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only fetch once on mount

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    refresh,
  }
}
