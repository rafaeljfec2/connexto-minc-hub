import { Schedule, Service } from '@minc-hub/shared/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatsCardMobile } from './StatsCardMobile'
import { formatNextService } from '../utils/formatNextService'

interface NextServiceCardProps {
  readonly schedule: Schedule | undefined
  readonly service: Service | undefined | null
  readonly variant?: 'mobile' | 'desktop'
}

const CalendarIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

export function NextServiceCard({ schedule, service, variant = 'desktop' }: NextServiceCardProps) {
  const displayValue = schedule && service ? formatNextService(schedule, service) : '-'

  if (variant === 'mobile') {
    return <StatsCardMobile title="Próx. Culto" value={displayValue} icon={<CalendarIcon />} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-dark-600 dark:text-dark-400">
          Próximo Culto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-dark-900 dark:text-dark-50">{displayValue}</div>
      </CardContent>
    </Card>
  )
}
