import { useState, useCallback, useEffect } from 'react'
import { Ministry } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { AxiosError } from 'axios'
import { ApiResponse } from '@minc-hub/shared/types'

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

  const fetchMinistries = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiServices.ministriesService.getAll()
      setMinistries(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch ministries')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

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

  // Auto-fetch on mount
  useEffect(() => {
    fetchMinistries().catch(() => {
      // Error already handled in fetchMinistries
    })
  }, [fetchMinistries])

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
