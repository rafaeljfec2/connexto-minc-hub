import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Team, ApiResponse } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useChurch } from '@/contexts/ChurchContext'
import { useMinistries } from '@/hooks/useMinistries'
import { AxiosError } from 'axios'
import { getCachedFetch } from './utils/fetchCache'

type CreateTeam = Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'memberIds'>

interface UseTeamsReturn {
  teams: Team[]
  isLoading: boolean
  error: Error | null
  fetchTeams: () => Promise<void>
  getTeamById: (id: string) => Promise<Team | null>
  createTeam: (data: CreateTeam) => Promise<Team>
  updateTeam: (id: string, data: Partial<Team>) => Promise<Team>
  deleteTeam: (id: string) => Promise<void>
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

export function useTeams(): UseTeamsReturn {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { showSuccess, showError } = useToast()
  const { selectedChurch } = useChurch()
  const { ministries } = useMinistries()
  const hasFetchedRef = useRef<string | null>(null)
  const lastMinistryIdsLengthRef = useRef<number>(0)

  // Get ministry IDs for the selected church
  const ministryIds = useMemo(() => {
    if (!selectedChurch) return []
    return ministries.filter(m => m.churchId === selectedChurch.id).map(m => m.id)
  }, [selectedChurch, ministries])

  const fetchTeams = useCallback(async () => {
    if (!selectedChurch) {
      setTeams([])
      return
    }

    const cacheKey = `teams-${selectedChurch.id}-${ministryIds.length}`

    await getCachedFetch(cacheKey, async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch all teams (without filter) and filter by ministryIds on frontend
        const allTeams = await apiServices.teamsService.getAll()

        // Filter teams by ministries of the selected church
        const filteredTeams = allTeams.filter(team => ministryIds.includes(team.ministryId))

        setTeams(filteredTeams)
        return filteredTeams
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch teams')
        setError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChurch?.id, ministryIds.length])

  const getTeamById = useCallback(async (id: string): Promise<Team | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const team = await apiServices.teamsService.getById(id)
      return team ?? null
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch team')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTeam = useCallback(
    async (data: CreateTeam): Promise<Team> => {
      try {
        setIsLoading(true)
        setError(null)
        // Remove memberIds and churchId if present - backend doesn't accept these
        const {
          memberIds: _memberIds,
          churchId: _churchId,
          ...cleanData
        } = data as CreateTeam & {
          memberIds?: string[]
          churchId?: string
        }
        const newTeam = await apiServices.teamsService.create(cleanData)
        setTeams(prev => [...prev, newTeam])
        showSuccess('Equipe criada com sucesso!')
        return newTeam
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao criar equipe')
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

  const updateTeam = useCallback(
    async (id: string, data: Partial<Team>): Promise<Team> => {
      try {
        setIsLoading(true)
        setError(null)
        // Remove memberIds and churchId if present - backend doesn't accept these
        const {
          memberIds: _memberIds,
          churchId: _churchId,
          ...cleanData
        } = data as Partial<Team> & {
          memberIds?: string[]
          churchId?: string
        }
        const updatedTeam = await apiServices.teamsService.update(id, cleanData)
        setTeams(prev => prev.map(team => (team.id === id ? updatedTeam : team)))
        showSuccess('Equipe atualizada com sucesso!')
        return updatedTeam
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao atualizar equipe')
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

  const deleteTeam = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)
        await apiServices.teamsService.delete(id)
        setTeams(prev => prev.filter(team => team.id !== id))
        showSuccess('Equipe excluída com sucesso!')
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Falha ao excluir equipe')
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
    await fetchTeams()
  }, [fetchTeams])

  // Auto-fetch on mount and when church or ministries change
  useEffect(() => {
    if (!selectedChurch) {
      setTeams([])
      hasFetchedRef.current = null
      lastMinistryIdsLengthRef.current = 0
      return
    }

    const churchId = selectedChurch.id
    const ministryIdsLength = ministryIds.length

    // Prevent duplicate calls for the same church and ministry count
    if (
      hasFetchedRef.current === churchId &&
      lastMinistryIdsLengthRef.current === ministryIdsLength
    ) {
      return
    }

    // Always fetch when church changes or ministries change
    hasFetchedRef.current = churchId
    lastMinistryIdsLengthRef.current = ministryIdsLength

    fetchTeams().catch(_error => {
      // Reset ref on error so it can retry
      hasFetchedRef.current = null
      // Error already handled in fetchTeams
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChurch?.id, ministryIds.length]) // Only depend on primitive values to prevent loops

  return {
    teams,
    isLoading,
    error,
    fetchTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    refresh,
  }
}
