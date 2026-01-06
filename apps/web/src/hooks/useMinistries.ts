import { useState, useCallback, useEffect, useRef } from 'react'
import { Ministry } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useChurch } from '@/contexts/ChurchContext'
import { AxiosError } from 'axios'
import { ApiResponse } from '@minc-hub/shared/types'
import { getCachedFetch } from './utils/fetchCache'

type CreateMinistry = Omit<Ministry, 'id' | 'createdAt' | 'updatedAt'>

interface UseMinistriesReturn {
  ministries: Ministry[]
  isLoading: boolean
  error: Error | null
  fetchMinistries: () => Promise<void>
  getMinistryById: (id: string) => Promise<Ministry | null>
  createMinistry: (data: CreateMinistry) => Promise<Ministry>
  updateMinistry: (id: string, data: Partial<Ministry>) => Promise<Ministry>
  deleteMinistry: (id: string) => Promise<void>
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

export function useMinistries(): UseMinistriesReturn {
  const [ministries, setMinistries] = useState<Ministry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { showSuccess, showError } = useToast()
  const { selectedChurch } = useChurch()
  const hasFetchedRef = useRef<string | null>(null)

  const fetchMinistries = useCallback(async (): Promise<void> => {
    if (!selectedChurch) {
      setMinistries([])
      return
    }

    const cacheKey = `ministries-${selectedChurch.id}`
    
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await getCachedFetch(
        cacheKey,
        async () => {
          const fetchedData = await apiServices.ministriesService.getAll(selectedChurch.id)
          return fetchedData
        }
      )
      
      // Always update state with the data, whether from cache or new fetch
      if (data && Array.isArray(data)) {
        setMinistries(data)
      } else {
        setMinistries([])
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch ministries')
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedChurch?.id])

  const getMinistryById = useCallback(async (id: string): Promise<Ministry | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const ministry = await apiServices.ministriesService.getById(id)
      return ministry ?? null
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch ministry')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createMinistry = useCallback(
    async (data: CreateMinistry): Promise<Ministry> => {
      try {
        setIsLoading(true)
        setError(null)
        const newMinistry = await apiServices.ministriesService.create(data)
        setMinistries(prev => [...prev, newMinistry])
        showSuccess('Ministério criado com sucesso!')
        return newMinistry
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao criar ministério')
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

  const updateMinistry = useCallback(
    async (id: string, data: Partial<Ministry>): Promise<Ministry> => {
      try {
        setIsLoading(true)
        setError(null)
        const updatedMinistry = await apiServices.ministriesService.update(id, data)
        setMinistries(prev => prev.map(ministry => (ministry.id === id ? updatedMinistry : ministry)))
        showSuccess('Ministério atualizado com sucesso!')
        return updatedMinistry
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao atualizar ministério')
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

  const deleteMinistry = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        await apiServices.ministriesService.delete(id)
        setMinistries(prev => prev.filter(ministry => ministry.id !== id))
        showSuccess('Ministério excluído com sucesso!')
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao excluir ministério')
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
    await fetchMinistries()
  }, [fetchMinistries])

  // Auto-fetch on mount and when church changes
  useEffect(() => {
    if (!selectedChurch) {
      setMinistries([])
      hasFetchedRef.current = null
      return
    }

    const churchId = selectedChurch.id
    // Prevent duplicate calls for the same church
    if (hasFetchedRef.current === churchId) {
      return
    }

    hasFetchedRef.current = churchId
    fetchMinistries().catch((err) => {
      // Reset ref on error so it can retry
      hasFetchedRef.current = null
      // Error already handled in fetchMinistries
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChurch?.id]) // Only depend on selectedChurch.id to prevent loops

  return {
    ministries,
    isLoading,
    error,
    fetchMinistries,
    getMinistryById,
    createMinistry,
    updateMinistry,
    deleteMinistry,
    refresh,
  }
}
