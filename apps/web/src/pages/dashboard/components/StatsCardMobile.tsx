import { Card } from '@/components/ui/Card'

interface StatsCardMobileProps {
  readonly title: string
  readonly value: string | number
  readonly icon: React.ReactNode
  readonly trend?: string
}

export function StatsCardMobile({ title, value, icon, trend }: Readonly<StatsCardMobileProps>) {
  return (
    <Card className="flex-1 min-w-[45%] p-4 rounded-3xl border-none shadow-sm bg-white dark:bg-dark-900">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-primary-900/10 text-orange-500 dark:text-primary-400">
          {icon}
        </div>
        {trend && (
          <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-primary-900/20 text-[10px] font-bold text-orange-600 dark:text-primary-400">
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <div className="text-2xl font-bold text-dark-900 dark:text-dark-50">{value}</div>
        <div className="text-xs font-medium text-dark-500 dark:text-dark-400">{title}</div>
      </div>
    </Card>
  )
}
