import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Schedule, Service, Team, Person, Ministry } from '@minc-hub/shared/types'
import { ScheduleDetailsModal } from './ScheduleDetailsModal'
import { parseLocalDate, formatTime } from '@/lib/utils'

interface UpcomingServicesMobileProps {
  readonly schedules: readonly Schedule[]
  readonly services: readonly Service[]
  readonly teams: readonly Team[]
  readonly people: readonly Person[]
  readonly ministries: readonly Ministry[]
}

export function UpcomingServicesMobile({
  schedules,
  services,
  teams,
  people,
  ministries,
}: Readonly<UpcomingServicesMobileProps>) {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const upcomingSchedules = schedules
    .filter(schedule => {
      const scheduleDate = parseLocalDate(schedule.date)
      return scheduleDate >= new Date(new Date().setHours(0, 0, 0, 0))
    })
    .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())
    .slice(0, 5)

  if (upcomingSchedules.length === 0) {
    return null
  }

  const handleScheduleClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSchedule(null)
  }

  const selectedService = selectedSchedule
    ? services.find(s => s.id === selectedSchedule.serviceId) || null
    : null

  return (
    <div className="mb-6">
      <h2 className="text-base font-semibold text-dark-900 dark:text-dark-50 mb-4 px-4">
        Próximas Escalas
      </h2>
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {upcomingSchedules.map(schedule => {
          const service = services.find(s => s.id === schedule.serviceId)
          const scheduleDate = parseLocalDate(schedule.date)
          const day = scheduleDate.getDate().toString()
          const month = scheduleDate
            .toLocaleDateString('pt-BR', { month: 'short' })
            .replace('.', '')
          const time = scheduleDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
          const formattedTime = service?.time ? formatTime(service.time) : time

          return (
            <button
              key={schedule.id}
              onClick={() => handleScheduleClick(schedule)}
              className="text-left focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-xl"
            >
              <Card className="flex flex-row items-center p-4 w-[280px] gap-4 flex-shrink-0 active:scale-95 transition-transform cursor-pointer hover:shadow-md">
                <div className="p-3 rounded-lg bg-primary-500/15 text-center min-w-[50px]">
                  <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {day}
                  </div>
                  <div className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase">
                    {month}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-dark-900 dark:text-dark-50 truncate mb-0.5">
                    {service?.name ?? 'Culto'}
                  </div>
                  <div className="text-xs text-dark-900 dark:text-dark-50 truncate mb-1">
                    {formattedTime}
                  </div>
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      <ScheduleDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        schedule={selectedSchedule}
        service={selectedService}
        teams={[...teams]}
        people={[...people]}
        ministries={[...ministries]}
      />
    </div>
  )
}
