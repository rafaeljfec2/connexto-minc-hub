import { Schedule, Service } from '@minc-hub/shared/types'
import { parseLocalDate, formatTime } from '@/lib/utils'

export function formatNextService(schedule: Schedule, service: Service | null | undefined): string {
  if (!service) return '-'

  const scheduleDate = parseLocalDate(schedule.date)
  const weekday = scheduleDate
    .toLocaleDateString('pt-BR', {
      weekday: 'short',
    })
    .replace('.', '')

  const time = service.time
    ? formatTime(service.time)
    : scheduleDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })

  return `${weekday} ${time}`
}
