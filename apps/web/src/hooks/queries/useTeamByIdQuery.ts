import { useQuery } from '@tanstack/react-query'
import { Team } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useChurch } from '@/contexts/ChurchContext'

const apiServices = createApiServices(api)

export function useTeamByIdQuery(teamId: string | undefined) {
  const { selectedChurch } = useChurch()
  const companyId = selectedChurch?.id

  return useQuery<Team | null>({
    queryKey: ['team', companyId, teamId],
    queryFn: async () => {
      if (!teamId) return null
      return apiServices.teamsService.getById(teamId)
    },
    enabled: !!companyId && !!teamId,
  })
}
