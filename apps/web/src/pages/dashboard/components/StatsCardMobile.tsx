import { Card } from '@/components/ui/Card'

interface StatsCardMobileProps {
  readonly title: string
  readonly value: string | number
  readonly icon: React.ReactNode
  readonly trend?: string
}

export function StatsCardMobile({ title, value, icon, trend }: Readonly<StatsCardMobileProps>) {
  return (
    <Card className="flex-1 min-w-[45%] p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-primary-500/15 text-primary-600 dark:text-primary-400">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <div className="text-xl font-bold text-dark-900 dark:text-dark-50">{value}</div>
        <div className="text-xs font-medium text-dark-600 dark:text-dark-400">{title}</div>
      </div>
    </Card>
  )
}
