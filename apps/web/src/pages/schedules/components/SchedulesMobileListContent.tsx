import { Accordion } from '@/components/ui/Accordion'
import { ScheduleGroupItem, GroupedSchedule } from '@/components/schedules/ScheduleGroupItem'
import type { Team, Ministry, Schedule } from '@minc-hub/shared/types'

interface SchedulesMobileListContentProps {
  readonly groupedSchedules: GroupedSchedule[]
  readonly isLoading: boolean
  readonly teams: Team[]
  readonly ministries: Ministry[]
  readonly onEdit: (schedule?: Schedule) => void
  readonly onDelete: (id: string) => void
  readonly searchTerm: string
}

export function SchedulesMobileListContent({
  groupedSchedules,
  isLoading,
  teams,
  ministries,
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
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-dark-900 rounded-lg border border-dark-200 dark:border-dark-800">
        <p className="text-dark-500 dark:text-dark-400">
          {searchTerm ? 'Nenhuma escala encontrada' : 'Nenhuma escala neste período'}
        </p>
      </div>
    )
  }

  // Use the same structure as current desktop/default view but ensuring it looks good on mobile
  return (
    <div className="space-y-4">
      <Accordion className="space-y-4">
        {groupedSchedules.map(group => (
          <ScheduleGroupItem
            key={group.key}
            group={group}
            teams={teams}
            ministries={ministries}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </Accordion>
    </div>
  )
}
