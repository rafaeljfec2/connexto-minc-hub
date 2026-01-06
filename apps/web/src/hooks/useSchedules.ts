import { useState, useCallback, useEffect, useRef } from 'react'
import { Schedule } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useChurch } from '@/contexts/ChurchContext'
import { AxiosError } from 'axios'
import { ApiResponse } from '@minc-hub/shared/types'
import { getCachedFetch } from './utils/fetchCache'

type CreateSchedule = Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>

interface UseSchedulesReturn {
  schedules: Schedule[]
  isLoading: boolean
  error: Error | null
  fetchSchedules: (serviceId?: string, startDate?: string, endDate?: string) => Promise<void>
  getScheduleById: (id: string) => Promise<Schedule | null>
  createSchedule: (data: CreateSchedule) => Promise<Schedule>
  updateSchedule: (id: string, data: Partial<Schedule>) => Promise<Schedule>
  deleteSchedule: (id: string) => Promise<void>
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

export function useSchedules(): UseSchedulesReturn {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { showSuccess, showError } = useToast()
  const { selectedChurch } = useChurch()
  const hasFetchedRef = useRef<string | null>(null)

  const fetchSchedules = useCallback(
    async (serviceId?: string, startDate?: string, endDate?: string) => {
      if (!selectedChurch) {
        setSchedules([])
        return
      }

      const cacheKey = `schedules-${selectedChurch.id}-${serviceId ?? 'all'}-${startDate ?? ''}-${endDate ?? ''}`

      await getCachedFetch(cacheKey, async () => {
        try {
          setIsLoading(true)
          setError(null)
          const data = await apiServices.schedulesService.getAll(serviceId, startDate, endDate)
          // Filter schedules by selected church (via service.churchId)
          const filteredData = data.filter(schedule => {
            // If schedule has service relationship, filter by churchId
            if ('service' in schedule && (schedule as any).service) {
              return (schedule as any).service.churchId === selectedChurch.id
            }
            // Otherwise, we need to fetch service to check churchId
            // For now, include all schedules and let the backend filter
            return true
          })
          setSchedules(filteredData)
          return filteredData
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to fetch schedules')
          setError(error)
          throw error
        } finally {
          setIsLoading(false)
        }
      })
    },
    [selectedChurch?.id]
  )

  const getScheduleById = useCallback(async (id: string): Promise<Schedule | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const schedule = await apiServices.schedulesService.getById(id)
      return schedule ?? null
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch schedule')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createSchedule = useCallback(
    async (data: CreateSchedule): Promise<Schedule> => {
      try {
        setIsLoading(true)
        setError(null)
        const newSchedule = await apiServices.schedulesService.create(data)
        setSchedules(prev => [...prev, newSchedule])
        showSuccess('Escala criada com sucesso!')
        return newSchedule
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao criar escala')
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

  const updateSchedule = useCallback(
    async (id: string, data: Partial<Schedule>): Promise<Schedule> => {
      try {
        setIsLoading(true)
        setError(null)
        const updatedSchedule = await apiServices.schedulesService.update(id, data)
        setSchedules(prev =>
          prev.map(schedule => (schedule.id === id ? updatedSchedule : schedule))
        )
        showSuccess('Escala atualizada com sucesso!')
        return updatedSchedule
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao atualizar escala')
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

  const deleteSchedule = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        await apiServices.schedulesService.delete(id)
        setSchedules(prev => prev.filter(schedule => schedule.id !== id))
        showSuccess('Escala excluída com sucesso!')
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao excluir escala')
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
    await fetchSchedules()
  }, [fetchSchedules])

  // Auto-fetch on mount and when church changes
  useEffect(() => {
    const churchId = selectedChurch?.id
    // Prevent duplicate calls for the same church
    if (hasFetchedRef.current === churchId) {
      return
    }

    if (selectedChurch) {
      hasFetchedRef.current = churchId ?? null
      fetchSchedules().catch(() => {
        // Error already handled in fetchSchedules
      })
    } else {
      hasFetchedRef.current = null
      setSchedules([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChurch?.id]) // Only depend on selectedChurch.id to prevent loops

  return {
    schedules,
    isLoading,
    error,
    fetchSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    refresh,
  }
}
