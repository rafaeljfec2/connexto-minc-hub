import type { Schedule, Service, Team, Ministry } from '@minc-hub/shared/types'
import { CompactListItem } from '@/components/ui/CompactListItem'
import { formatDate, parseLocalDate, formatTime } from '@/lib/utils'
import { getDayLabel } from '@/lib/constants'

interface ScheduleListItemProps {
  readonly schedule: Schedule
  readonly service: Service | undefined
  readonly teams: Team[]
  readonly ministries: Ministry[]
  readonly onEdit?: (schedule: Schedule) => void
  readonly onDelete?: (schedule: Schedule) => void
  readonly onClick?: (schedule: Schedule) => void
}

export function ScheduleListItem({
  schedule,
  service,
  teams,
  ministries,
  onEdit,
  onDelete,
  onClick,
}: ScheduleListItemProps) {
  const scheduleDate = parseLocalDate(schedule.date)
  const dayLabel = getDayLabel(scheduleDate.getDay())
  const formattedDate = formatDate(schedule.date)
  const serviceTime = service?.time ? formatTime(service.time) : 'N/A'

  // Get team names
  const teamNames = schedule.teamIds
    ?.map(teamId => {
      const team = teams.find(t => t.id === teamId)
      const ministry = ministries.find(m => m.id === team?.ministryId)
      return ministry ? `${ministry.name}` : team?.name || ''
    })
    .filter(Boolean)
    .join(', ')

  return (
    <CompactListItem
      icon={
        <svg
          className="w-5 h-5 text-primary-600 dark:text-primary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      }
      title={service?.name || 'Culto Desconhecido'}
      subtitle={`${formattedDate} (${dayLabel}) • ${serviceTime}`}
      metadata={teamNames || 'Sem equipes'}
      onClick={() => onClick?.(schedule)}
      onEdit={onEdit ? () => onEdit(schedule) : undefined}
      onDelete={onDelete ? () => onDelete(schedule) : undefined}
      stacked
    />
  )
}
