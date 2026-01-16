import { useState, useCallback, useEffect } from 'react'
import { Person, ApiResponse } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useChurch } from '@/contexts/ChurchContext'
import { AxiosError } from 'axios'
import { getCachedFetch } from './utils/fetchCache'

function extractErrorMessage(err: unknown, defaultMessage: string): string {
  if (err instanceof AxiosError && err.response) {
    const apiResponse = err.response.data as ApiResponse<unknown>
    if (apiResponse?.message) {
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

  const fetchPeople = useCallback(async (): Promise<void> => {
    if (!selectedChurch) {
      setPeople([])
      return
    }

    const cacheKey = `people-${selectedChurch.id}`

    try {
      setIsLoading(true)
      setError(null)
      // Fetch all people - filtering by ministry will be done in the UI when user selects a filter
      const allPeople = await getCachedFetch(cacheKey, async () => {
        return await apiServices.peopleService.getAll()
      })

      // Always update state with fetched data
      setPeople(allPeople)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch people')
      setError(error)
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChurch?.id])

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

  // Auto-fetch on mount and when church changes
  useEffect(() => {
    if (!selectedChurch) {
      setPeople([])
      return
    }

    // Always fetch when church changes
    fetchPeople().catch(_error => {
      // Error already handled in fetchPeople
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChurch?.id])

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
