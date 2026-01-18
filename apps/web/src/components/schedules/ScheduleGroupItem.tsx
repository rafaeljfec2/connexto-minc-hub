import { Button } from '@/components/ui/Button'
import { EditIcon } from '@/components/icons'
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/Accordion'
import { Schedule, Team, Ministry, Service } from '@minc-hub/shared/types'
import { formatDate } from '@minc-hub/shared/utils'
import { getDayLabel } from '@/lib/constants'
import { ScheduleCard } from './ScheduleCard'

// Helper to group schedules - Imported locally or redefined
// Ideally, this should be shared, but re-defining interface for props is fine if simple
// Or import from a shared types location if it existed.
// Given it was in SchedulesPage, let's redefine it here or move it to shared.
// For now, I'll redefine it to match what's expected.

export interface GroupedSchedule {
  key: string
  date: Date
  serviceId: string
  serviceName: string
  serviceDay: number
  serviceTime: string
  schedules: Schedule[]
}

interface ScheduleGroupItemProps {
  group: GroupedSchedule
  teams: Team[]
  ministries: Ministry[]
  services: Service[]
  onEdit: (s: Schedule) => void
  onDelete: (id: string) => void
}

export function ScheduleGroupItem({
  group,
  teams,
  ministries,
  services,
  onEdit,
  onDelete,
}: ScheduleGroupItemProps) {
  // Group schedules by service within the day
  const schedulesByService = group.schedules.reduce(
    (acc, schedule) => {
      const serviceId = schedule.serviceId
      if (!acc[serviceId]) {
        acc[serviceId] = []
      }
      acc[serviceId].push(schedule)
      return acc
    },
    {} as Record<string, Schedule[]>
  )

  return (
    <AccordionItem value={group.key}>
      <AccordionTrigger>
        <div className="flex flex-1 items-center justify-between mr-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-dark-900 dark:text-dark-50">
                {formatDate(group.date.toISOString())}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400">
                {getDayLabel(group.serviceDay)}
              </span>
            </div>
            <span className="text-sm text-dark-600 dark:text-dark-300">
              {Object.keys(schedulesByService).length}{' '}
              {Object.keys(schedulesByService).length === 1 ? 'culto' : 'cultos'}
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {Object.entries(schedulesByService).map(([serviceId, schedules]) => {
            const service = services.find(s => s.id === serviceId)
            const serviceName = service?.name ?? 'Culto'
            const serviceTime = service?.time ?? ''

            return (
              <div key={serviceId} className="space-y-2">
                {/* Service header */}
                <div className="flex items-center justify-between px-3 py-2 bg-dark-50 dark:bg-dark-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-dark-900 dark:text-dark-50">
                      {serviceName}
                    </span>
                    {serviceTime && (
                      <span className="text-xs text-dark-600 dark:text-dark-400">
                        {serviceTime}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="action-edit"
                    size="sm"
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (schedules.length > 0) {
                        onEdit(schedules[0])
                      }
                    }}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Schedule cards for this service */}
                <div className="space-y-2 pl-2">
                  {schedules.map(schedule => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      teams={teams}
                      ministries={ministries}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
