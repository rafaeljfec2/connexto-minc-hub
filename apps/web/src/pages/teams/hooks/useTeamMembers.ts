import { useState, useEffect, useCallback } from 'react'
import { Team, Person } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'

const apiServices = createApiServices(api)

interface UseTeamMembersResult {
  readonly members: Person[]
  readonly leader: Person | null
  readonly isLoading: boolean
  readonly refresh: () => Promise<void>
}

export function useTeamMembers(team: Team | null, shouldFetch: boolean): UseTeamMembersResult {
  const [members, setMembers] = useState<Person[]>([])
  const [leader, setLeader] = useState<Person | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasFetchedMembers, setHasFetchedMembers] = useState(false)

  const fetchMembers = useCallback(async () => {
    if (!team?.memberIds?.length) {
      setMembers([])
      setLeader(null)
      return
    }

    try {
      setIsLoading(true)
      const allPeople = await apiServices.peopleService.getAll()
      const teamMembers = allPeople.filter(person => team.memberIds.includes(person.id))
      setMembers(teamMembers)

      if (team.leaderId) {
        const teamLeader = allPeople.find(person => person.id === team.leaderId)
        setLeader(teamLeader || null)
      } else {
        setLeader(null)
      }

      setHasFetchedMembers(true)
    } catch (error) {
      console.error('Failed to fetch members:', error)
      setMembers([])
      setLeader(null)
    } finally {
      setIsLoading(false)
    }
  }, [team?.memberIds, team?.leaderId])

  useEffect(() => {
    if (shouldFetch && !hasFetchedMembers && team) {
      fetchMembers()
    }
  }, [shouldFetch, hasFetchedMembers, team, fetchMembers])

  return {
    members,
    leader,
    isLoading,
    refresh: fetchMembers,
  }
}
