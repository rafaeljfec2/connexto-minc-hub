import { Accordion } from '@/components/ui/Accordion'
import { ScheduleGroupItem, GroupedSchedule } from '@/components/schedules/ScheduleGroupItem'
import type { Team, Ministry, Schedule, Service } from '@minc-hub/shared/types'

interface SchedulesDesktopListProps {
  readonly groupedSchedules: GroupedSchedule[]
  readonly isLoading: boolean
  readonly teams: Team[]
  readonly ministries: Ministry[]
  readonly services: Service[]
  readonly onEdit: (schedule?: Schedule) => void
  readonly onDelete: (id: string) => void
}

export function SchedulesDesktopList({
  groupedSchedules,
  isLoading,
  teams,
  ministries,
  services,
  onEdit,
  onDelete,
}: SchedulesDesktopListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
      </div>
    )
  }

  if (groupedSchedules.length === 0) {
    return (
      <div className="text-center py-12 text-dark-500 dark:text-dark-400 bg-white dark:bg-dark-900 rounded-xl border border-dark-200 dark:border-dark-800">
        Nenhuma escala encontrada para este período.
      </div>
    )
  }

  return (
    <Accordion className="space-y-4">
      {groupedSchedules.map(group => (
        <ScheduleGroupItem
          key={group.key}
          group={group}
          teams={teams}
          ministries={ministries}
          services={services}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Accordion>
  )
}
