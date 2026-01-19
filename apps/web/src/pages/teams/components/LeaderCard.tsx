import { Star } from 'lucide-react'
import { Person } from '@minc-hub/shared/types'
import { Avatar } from '@/components/ui/Avatar'
import { ItemMenuDropdown, MenuItem } from '@/components/ui/ItemMenuDropdown'

interface LeaderCardProps {
  readonly leader: Person
  readonly onDemote?: () => void
  readonly onRemove?: () => void
}

export function LeaderCard({ leader, onDemote, onRemove }: LeaderCardProps) {
  const menuItems: MenuItem[] = []

  if (onDemote) {
    menuItems.push({
      label: 'Remover Liderança',
      onClick: onDemote,
      icon: <Star className="w-4 h-4" />,
    })
  }

  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-800 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar src={leader.avatar} name={leader.name} size="lg" />
          <div className="absolute -bottom-1 -right-1 bg-primary-500 rounded-full p-1 border-2 border-white dark:border-dark-900">
            <Star className="w-2.5 h-2.5 text-white fill-white" />
          </div>
        </div>
        <div>
          <h4 className="font-bold text-dark-900 dark:text-dark-50 text-sm">{leader.name}</h4>
          <p className="text-primary-600 dark:text-primary-400 text-xs font-medium">
            Líder da Equipe
          </p>
        </div>
      </div>
      <ItemMenuDropdown menuItems={menuItems} onDelete={onRemove} />
    </div>
  )
}
