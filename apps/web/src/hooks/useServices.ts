import { useState, useCallback, useEffect, useRef } from 'react'
import { Service, ApiResponse } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useChurch } from '@/contexts/ChurchContext'
import { AxiosError } from 'axios'
import { getCachedFetch } from './utils/fetchCache'

type CreateService = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>

interface UseServicesReturn {
  services: Service[]
  isLoading: boolean
  error: Error | null
  fetchServices: () => Promise<void>
  getServiceById: (id: string) => Promise<Service | null>
  createService: (data: CreateService) => Promise<Service>
  updateService: (id: string, data: Partial<Service>) => Promise<Service>
  deleteService: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const apiServices = createApiServices(api)

function extractErrorMessage(err: unknown, defaultMessage: string): string {
  if (err instanceof AxiosError && err.response) {
    const apiResponse = err.response.data as ApiResponse<unknown>
    if (apiResponse?.message) {
      return apiResponse.message
    }
  }
  return err instanceof Error ? err.message : defaultMessage
}

export function useServices(): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { showSuccess, showError } = useToast()
  const { selectedChurch } = useChurch()
  const hasFetchedRef = useRef<string | null>(null)

  const fetchServices = useCallback(async () => {
    if (!selectedChurch) {
      setServices([])
      return
    }

    const cacheKey = `services-${selectedChurch.id}`

    await getCachedFetch(cacheKey, async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await apiServices.servicesService.getAll(selectedChurch.id)
        setServices(data)
        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch services')
        setError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChurch?.id])

  const getServiceById = useCallback(async (id: string): Promise<Service | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const service = await apiServices.servicesService.getById(id)
      return service ?? null
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch service')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createService = useCallback(
    async (data: CreateService): Promise<Service> => {
      try {
        setIsLoading(true)
        setError(null)
        const newService = await apiServices.servicesService.create(data)
        setServices(prev => [...prev, newService])
        showSuccess('Culto criado com sucesso!')
        return newService
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao criar culto')
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

  const updateService = useCallback(
    async (id: string, data: Partial<Service>): Promise<Service> => {
      try {
        setIsLoading(true)
        setError(null)
        const updatedService = await apiServices.servicesService.update(id, data)
        setServices(prev => prev.map(service => (service.id === id ? updatedService : service)))
        showSuccess('Culto atualizado com sucesso!')
        return updatedService
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao atualizar culto')
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

  const deleteService = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        await apiServices.servicesService.delete(id)
        setServices(prev => prev.filter(service => service.id !== id))
        showSuccess('Culto excluído com sucesso!')
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao excluir culto')
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
    await fetchServices()
  }, [fetchServices])

  // Auto-fetch on mount and when church changes
  useEffect(() => {
    const churchId = selectedChurch?.id
    // Prevent duplicate calls for the same church
    if (hasFetchedRef.current === churchId) {
      return
    }

    if (selectedChurch) {
      hasFetchedRef.current = churchId ?? null
      fetchServices().catch(() => {
        // Error already handled in fetchServices
      })
    } else {
      hasFetchedRef.current = null
      setServices([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChurch?.id]) // Only depend on selectedChurch.id to prevent loops

  return {
    services,
    isLoading,
    error,
    fetchServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    refresh,
  }
}
