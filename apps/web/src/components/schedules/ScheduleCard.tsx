import { Button } from '@/components/ui/Button'
import { TrashIcon } from '@/components/icons'
import { Schedule, Team, Ministry } from '@minc-hub/shared/types'

interface ScheduleCardProps {
  schedule: Schedule
  teams: Team[]
  ministries: Ministry[]
  onDelete: (id: string) => void
}

export function ScheduleCard({ schedule, teams, ministries, onDelete }: ScheduleCardProps) {
  return (
    <div className="flex items-start justify-between p-3 bg-white dark:bg-dark-950 rounded-lg border border-dark-200 dark:border-dark-800">
      <div className="space-y-1">
        <div className="flex flex-wrap gap-2">
          {schedule.teamIds && schedule.teamIds.length > 0 ? (
            schedule.teamIds.map(teamId => {
              const team = teams.find(t => t.id === teamId)
              const ministry = ministries.find(m => m.id === team?.ministryId)
              return (
                <span
                  key={teamId}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                >
                  {ministry?.name} - {team?.name}
                </span>
              )
            })
          ) : (
            <span className="text-dark-500 text-sm">Sem equipes</span>
          )}
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <Button variant="action-delete" size="sm" onClick={() => onDelete(schedule.id)}>
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
