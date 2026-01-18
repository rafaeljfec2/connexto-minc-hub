import { useMemo } from 'react'
import { Schedule, Service } from '@minc-hub/shared/types'
import { parseLocalDate } from '@/lib/utils'

interface ScheduleWithService {
  readonly schedule: Schedule
  readonly service: Service
}

function createScheduleDateTime(schedule: Schedule, service: Service): Date {
  const scheduleDate = parseLocalDate(schedule.date)
  const [hours, minutes] = service.time ? service.time.split(':').map(Number) : [0, 0]
  const scheduleDateTime = new Date(scheduleDate)
  scheduleDateTime.setHours(hours, minutes, 0, 0)
  return scheduleDateTime
}

function compareSchedules(a: ScheduleWithService, b: ScheduleWithService): number {
  const dateTimeA = createScheduleDateTime(a.schedule, a.service)
  const dateTimeB = createScheduleDateTime(b.schedule, b.service)
  return dateTimeA.getTime() - dateTimeB.getTime()
}

export function useUpcomingSchedules(
  schedules: readonly Schedule[],
  services: readonly Service[],
  limit = 1
): readonly Schedule[] {
  return useMemo(() => {
    const now = new Date()

    return schedules
      .map(schedule => {
        const service = services.find(s => s.id === schedule.serviceId)
        return { schedule, service }
      })
      .filter((item): item is ScheduleWithService => {
        if (!item.service) return false
        const scheduleDateTime = createScheduleDateTime(item.schedule, item.service)
        return scheduleDateTime > now
      })
      .sort(compareSchedules)
      .map(({ schedule }) => schedule)
      .slice(0, limit)
  }, [schedules, services, limit])
}
