import { useMemo } from 'react'
import { Schedule, Service } from '@minc-hub/shared/types'
import { useUpcomingSchedules } from './useUpcomingSchedules'

interface NextServiceResult {
  readonly schedule: Schedule | undefined
  readonly service: Service | undefined | null
}

export function useNextService(
  schedules: readonly Schedule[],
  services: readonly Service[]
): NextServiceResult {
  const upcomingSchedules = useUpcomingSchedules(schedules, services, 1)
  const nextSchedule = upcomingSchedules[0]

  const nextService = useMemo(() => {
    return nextSchedule ? services.find(s => s.id === nextSchedule.serviceId) : null
  }, [nextSchedule, services])

  return {
    schedule: nextSchedule,
    service: nextService,
  }
}
