import type { Team, Ministry, Schedule, Service } from '@minc-hub/shared/types'
import { ScheduleListItem } from './ScheduleListItem'
import type { GroupedSchedule } from '@/components/schedules/ScheduleGroupItem'
import { formatDate } from '@/lib/utils'
import { getDayLabel } from '@/lib/constants'

interface SchedulesMobileListContentProps {
  readonly groupedSchedules: GroupedSchedule[]
  readonly isLoading: boolean
  readonly teams: Team[]
  readonly ministries: Ministry[]
  readonly services: Service[]
  readonly onEdit: (schedule?: Schedule) => void
  readonly onDelete: (id: string) => void
  readonly searchTerm: string
}

export function SchedulesMobileListContent({
  groupedSchedules,
  isLoading,
  teams,
  ministries,
  services,
  onEdit,
  onDelete,
  searchTerm,
}: SchedulesMobileListContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (groupedSchedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-dark-500 dark:text-dark-400">
          {searchTerm ? 'Nenhuma escala encontrada' : 'Nenhuma escala neste período'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {groupedSchedules.map(group => {
        const formattedDate = formatDate(group.date.toISOString())
        const dayLabel = getDayLabel(group.date.getDay())

        return (
          <div key={group.key} className="space-y-2">
            {/* Day Header */}
            <div className="flex items-center gap-2 px-2">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-dark-900 dark:text-dark-50">
                  {formattedDate}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400">
                  {dayLabel}
                </span>
              </div>
              <span className="text-xs text-dark-500 dark:text-dark-400">
                {group.schedules.length} {group.schedules.length === 1 ? 'culto' : 'cultos'}
              </span>
            </div>

            {/* Schedules List for this day */}
            <div className="bg-white dark:bg-dark-900 rounded-lg overflow-hidden border border-dark-200 dark:border-dark-800">
              {group.schedules.map(schedule => {
                const service = services.find(s => s.id === schedule.serviceId)
                return (
                  <ScheduleListItem
                    key={schedule.id}
                    schedule={schedule}
                    service={service}
                    teams={teams}
                    ministries={ministries}
                    onEdit={onEdit}
                    onDelete={s => onDelete(s.id)}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
