import { useState, useCallback, useEffect, useMemo } from 'react'
import { Person, ApiResponse } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useChurch } from '@/contexts/ChurchContext'
import { useMinistries } from '@/hooks/useMinistries'
import { AxiosError } from 'axios'

function extractErrorMessage(err: unknown, defaultMessage: string): string {
  if (err instanceof AxiosError && err.response) {
    const apiResponse = err.response.data as ApiResponse<unknown>
    if (apiResponse && apiResponse.message) {
      return apiResponse.message
    }
  }
  return err instanceof Error ? err.message : defaultMessage
}

type CreatePerson = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>

interface UsePeopleReturn {
  people: Person[]
  isLoading: boolean
  error: Error | null
  fetchPeople: () => Promise<void>
  getPersonById: (id: string) => Promise<Person | null>
  createPerson: (data: CreatePerson) => Promise<Person>
  updatePerson: (id: string, data: Partial<Person>) => Promise<Person>
  deletePerson: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const apiServices = createApiServices(api)

export function usePeople(): UsePeopleReturn {
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { showSuccess, showError } = useToast()
  const { selectedChurch } = useChurch()
  const { ministries } = useMinistries()

  // Get ministry IDs for the selected church
  const ministryIds = useMemo(() => {
    if (!selectedChurch) return []
    return ministries.filter(m => m.churchId === selectedChurch.id).map(m => m.id)
  }, [selectedChurch, ministries])

  const fetchPeople = useCallback(async () => {
    if (!selectedChurch) {
      setPeople([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      // Backend doesn't support churchId filter, so fetch all and filter by ministryIds on frontend
      const allPeople = await apiServices.peopleService.getAll()
      
      // Filter people by ministries of the selected church
      const filteredPeople = allPeople.filter(person => 
        person.ministryId && ministryIds.includes(person.ministryId)
      )
      
      setPeople(filteredPeople)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch people')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [selectedChurch, ministryIds])

  const getPersonById = useCallback(async (id: string): Promise<Person | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const person = await apiServices.peopleService.getById(id)
      return person ?? null
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch person')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createPerson = useCallback(
    async (data: CreatePerson): Promise<Person> => {
      try {
        setIsLoading(true)
        setError(null)
        const newPerson = await apiServices.peopleService.create(data)
        setPeople(prev => [...prev, newPerson])
        showSuccess('Servo criado com sucesso!')
        return newPerson
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao criar servo')
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

  const updatePerson = useCallback(
    async (id: string, data: Partial<Person>): Promise<Person> => {
      try {
        setIsLoading(true)
        setError(null)
        const updatedPerson = await apiServices.peopleService.update(id, data)
        setPeople(prev => prev.map(person => (person.id === id ? updatedPerson : person)))
        showSuccess('Servo atualizado com sucesso!')
        return updatedPerson
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao atualizar servo')
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

  const deletePerson = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        await apiServices.peopleService.delete(id)
        setPeople(prev => prev.filter(person => person.id !== id))
        showSuccess('Servo excluído com sucesso!')
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao excluir servo')
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
    await fetchPeople()
  }, [fetchPeople])

  // Auto-fetch on mount and when church or ministries change
  useEffect(() => {
    if (selectedChurch) {
      fetchPeople().catch(() => {
        // Error already handled in fetchPeople
      })
    } else {
      setPeople([])
    }
  }, [fetchPeople, selectedChurch, ministryIds])

  return {
    people,
    isLoading,
    error,
    fetchPeople,
    getPersonById,
    createPerson,
    updatePerson,
    deletePerson,
    refresh,
  }
}
