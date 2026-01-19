import { useState, useEffect, useCallback } from 'react'
import { Team, Person, TeamMemberRole } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'

const apiServices = createApiServices(api)

interface UseTeamMembersResult {
  readonly members: Person[]
  readonly leaders: Person[]
  readonly isLoading: boolean
  readonly refresh: () => Promise<void>
}

export function useTeamMembers(team: Team | null, shouldFetch: boolean): UseTeamMembersResult {
  const [members, setMembers] = useState<Person[]>([])
  const [leaders, setLeaders] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasFetchedMembers, setHasFetchedMembers] = useState(false)
  const [lastTeamId, setLastTeamId] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!team) {
      setMembers([])
      setLeaders([])
      setHasFetchedMembers(true)
      return
    }

    try {
      setIsLoading(true)
      const teamMembers = await apiServices.teamsService.getMembers(team.id)

      const allMembers = teamMembers
        .map(tm => tm.person)
        .filter((p): p is Person => p !== undefined && p !== null)
      const teamLeaders = teamMembers
        .filter(tm => tm.role === TeamMemberRole.LIDER_DE_EQUIPE)
        .map(tm => tm.person)
        .filter((p): p is Person => p !== undefined && p !== null)

      setMembers(allMembers)
      setLeaders(teamLeaders)
      setHasFetchedMembers(true)
    } catch (error) {
      console.error('Failed to fetch members:', error)
      setMembers([])
      setLeaders([])
    } finally {
      setIsLoading(false)
    }
  }, [team])

  // Reset fetch state when team ID changes
  useEffect(() => {
    if (team?.id !== lastTeamId) {
      setHasFetchedMembers(false)
      setLastTeamId(team?.id ?? null)
    }
  }, [team?.id, lastTeamId])

  useEffect(() => {
    if (shouldFetch && !hasFetchedMembers && team) {
      fetchMembers()
    }
  }, [shouldFetch, hasFetchedMembers, team, fetchMembers])

  return {
    members,
    leaders,
    isLoading,
    refresh: fetchMembers,
  }
}
