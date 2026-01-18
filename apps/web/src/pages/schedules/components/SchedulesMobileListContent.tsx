import type { Team, Ministry, Schedule, Service } from '@minc-hub/shared/types'
import { ScheduleListItem } from './ScheduleListItem'
import type { GroupedSchedule } from '@/components/schedules/ScheduleGroupItem'

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

  // Flatten all schedules from groups
  const allSchedules = groupedSchedules.flatMap(group => group.schedules)

  if (allSchedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-dark-500 dark:text-dark-400">
          {searchTerm ? 'Nenhuma escala encontrada' : 'Nenhuma escala neste período'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-900 rounded-lg overflow-hidden border border-dark-200 dark:border-dark-800">
      {allSchedules.map(schedule => {
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
  )
}
