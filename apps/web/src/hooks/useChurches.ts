import { useState, useCallback, useEffect, useRef } from 'react'
import { Church } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import { getCachedFetch } from './utils/fetchCache'

type CreateChurch = Omit<Church, 'id' | 'createdAt' | 'updatedAt'>

interface UseChurchesReturn {
  churches: Church[]
  isLoading: boolean
  error: Error | null
  fetchChurches: () => Promise<void>
  getChurchById: (id: string) => Promise<Church | null>
  createChurch: (data: CreateChurch) => Promise<Church>
  updateChurch: (id: string, data: Partial<Church>) => Promise<Church>
  deleteChurch: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const apiServices = createApiServices(api)

function extractErrorMessage(err: unknown, defaultMessage: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = err.response as { data?: { message?: string } }
    return response?.data?.message ?? defaultMessage
  }
  if (err instanceof Error) {
    return err.message
  }
  return defaultMessage
}

export function useChurches(): UseChurchesReturn {
  const [churches, setChurches] = useState<Church[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { showSuccess, showError } = useToast()
  const hasFetchedRef = useRef<boolean>(false)

  const fetchChurches = useCallback(async (): Promise<void> => {
    const cacheKey = 'churches-all'

    try {
      setIsLoading(true)
      setError(null)

      const data = await getCachedFetch(
        cacheKey,
        async () => {
          const fetchedData = await apiServices.churchesService.getAll()
          return fetchedData
        },
        5000 // 5 seconds cache for churches (they don't change often)
      )

      // Always update state with the data, whether from cache or new fetch
      if (data && Array.isArray(data)) {
        setChurches(data)
      } else {
        setChurches([])
      }
    } catch (err) {
      console.error('Error in fetchChurches:', err)
      const error = err instanceof Error ? err : new Error('Failed to fetch churches')
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getChurchById = useCallback(async (id: string): Promise<Church | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const church = await apiServices.churchesService.getById(id)
      return church ?? null
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch church')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createChurch = useCallback(
    async (data: CreateChurch): Promise<Church> => {
      try {
        setIsLoading(true)
        setError(null)
        const newChurch = await apiServices.churchesService.create(data)
        setChurches(prev => [...prev, newChurch])
        showSuccess('Igreja criada com sucesso!')
        return newChurch
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao criar igreja')
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

  const updateChurch = useCallback(
    async (id: string, data: Partial<Church>): Promise<Church> => {
      try {
        setIsLoading(true)
        setError(null)
        const updatedChurch = await apiServices.churchesService.update(id, data)
        setChurches(prev => prev.map(church => (church.id === id ? updatedChurch : church)))
        showSuccess('Igreja atualizada com sucesso!')
        return updatedChurch
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao atualizar igreja')
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

  const deleteChurch = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        await apiServices.churchesService.delete(id)
        setChurches(prev => prev.filter(church => church.id !== id))
        showSuccess('Igreja excluída com sucesso!')
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao excluir igreja')
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
    await fetchChurches()
  }, [fetchChurches])

  const { isAuthenticated } = useAuth()

  // Auto-fetch on mount and when authentication status changes
  useEffect(() => {
    // If not authenticated, clear churches and reset fetched flag
    if (!isAuthenticated) {
      setChurches([])
      hasFetchedRef.current = false
      return
    }

    // Prevent duplicate calls if already fetched during this session
    // But allow if we are just becoming authenticated
    if (hasFetchedRef.current) {
      return
    }

    hasFetchedRef.current = true
    fetchChurches().catch(err => {
      // Log error for debugging but don't show toast to avoid spam
      console.error('Failed to fetch churches:', err)
    })
  }, [isAuthenticated, fetchChurches])

  return {
    churches,
    isLoading,
    error,
    fetchChurches,
    getChurchById,
    createChurch,
    updateChurch,
    deleteChurch,
    refresh,
  }
}
