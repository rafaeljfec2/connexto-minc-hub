import { Card } from '@/components/ui/Card'

export interface ActivityItem {
  id: string
  title: string
  description: string
  time?: string
  icon: React.ReactNode
  color?: string
}

interface ActivityFeedMobileProps {
  activities?: ActivityItem[]
}

export function ActivityFeedMobile({ activities = [] }: Readonly<ActivityFeedMobileProps>) {
  if (activities.length === 0) {
    return (
      <div className="px-4 mb-6">
        <Card className="p-4">
          <h2 className="text-base font-semibold text-dark-900 dark:text-dark-50 mb-4">
            Atividades Recentes
          </h2>
          <div className="text-sm text-dark-600 dark:text-dark-400">Nenhuma atividade recente</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-6 px-4">
      <h2 className="text-base font-semibold text-dark-900 dark:text-dark-50 mb-4">
        Atividades Recentes
      </h2>
      <Card className="p-4">
        <div className="space-y-4">
          {activities.map((item, index) => (
            <div key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center w-6">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: item.color ?? '#f97316' }}
                >
                  {item.icon}
                </div>
                {index < activities.length - 1 && (
                  <div className="w-0.5 flex-1 bg-dark-200 dark:bg-dark-800 my-1" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-dark-900 dark:text-dark-50">
                  {item.title}
                </div>
                <div className="text-xs text-dark-600 dark:text-dark-400 mt-0.5">
                  {item.description}
                </div>
                {item.time && (
                  <div className="text-[10px] text-dark-600 dark:text-dark-400 mt-1">
                    {item.time}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
