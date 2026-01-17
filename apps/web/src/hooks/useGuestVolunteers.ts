import { useState, useCallback } from 'react'
import { GuestVolunteer } from '@minc-hub/shared/types'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface UseGuestVolunteersReturn {
  guestVolunteers: GuestVolunteer[]
  isLoading: boolean
  error: Error | null
  fetchGuestVolunteers: (scheduleId: string) => Promise<void>
  addGuestVolunteer: (scheduleId: string, personId: string) => Promise<GuestVolunteer | null>
  removeGuestVolunteer: (scheduleId: string, personId: string) => Promise<void>
}

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

export function useGuestVolunteers(): UseGuestVolunteersReturn {
  const [guestVolunteers, setGuestVolunteers] = useState<GuestVolunteer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { showSuccess, showError } = useToast()

  const fetchGuestVolunteers = useCallback(async (scheduleId: string): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get<{ data: GuestVolunteer[] }>(
        `/schedules/${scheduleId}/guest-volunteers`
      )
      const data = response.data.data ?? response.data
      setGuestVolunteers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching guest volunteers:', err)
      const error = err instanceof Error ? err : new Error('Failed to fetch guest volunteers')
      setError(error)
      setGuestVolunteers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addGuestVolunteer = useCallback(
    async (scheduleId: string, personId: string): Promise<GuestVolunteer | null> => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.post<{ data: GuestVolunteer }>(
          `/schedules/${scheduleId}/guest-volunteers`,
          { personId }
        )
        const guestVolunteer = response.data.data ?? response.data
        setGuestVolunteers(prev => [...prev, guestVolunteer as GuestVolunteer])
        showSuccess('Voluntário avulso adicionado com sucesso!')
        return guestVolunteer as GuestVolunteer
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Erro ao adicionar voluntário avulso')
        const error = new Error(errorMessage)
        setError(error)
        showError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [showSuccess, showError]
  )

  const removeGuestVolunteer = useCallback(
    async (scheduleId: string, personId: string): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        await api.delete(`/schedules/${scheduleId}/guest-volunteers/${personId}`)
        setGuestVolunteers(prev => prev.filter(gv => gv.personId !== personId))
        showSuccess('Voluntário avulso removido com sucesso!')
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Erro ao remover voluntário avulso')
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

  return {
    guestVolunteers,
    isLoading,
    error,
    fetchGuestVolunteers,
    addGuestVolunteer,
    removeGuestVolunteer,
  }
}
