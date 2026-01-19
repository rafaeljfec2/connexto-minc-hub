import { useQuery } from '@tanstack/react-query'
import { Person } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useChurch } from '@/contexts/ChurchContext'

const apiServices = createApiServices(api)

export function usePersonByIdQuery(personId: string | undefined) {
  const { selectedChurch } = useChurch()
  const companyId = selectedChurch?.id

  return useQuery<Person | null>({
    queryKey: ['person', companyId, personId],
    queryFn: async () => {
      if (!personId) return null
      return apiServices.peopleService.getById(personId)
    },
    enabled: !!companyId && !!personId,
  })
}
