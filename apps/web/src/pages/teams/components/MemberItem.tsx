import { Check, Star } from 'lucide-react'
import { Person } from '@minc-hub/shared/types'
import { Avatar } from '@/components/ui/Avatar'
import { ItemMenuDropdown, MenuItem } from '@/components/ui/ItemMenuDropdown'

interface MemberItemProps {
  readonly member: Person
  readonly isLeader?: boolean
  readonly onDelete: () => void
  readonly onPromote?: () => void
  readonly onDemote?: () => void
}

export function MemberItem({
  member,
  isLeader = false,
  onDelete,
  onPromote,
  onDemote,
}: MemberItemProps) {
  const menuItems: MenuItem[] = []

  if (!isLeader && onPromote) {
    menuItems.push({
      label: 'Promover a Líder',
      onClick: onPromote,
      icon: <Star className="w-4 h-4" />,
    })
  }

  if (isLeader && onDemote) {
    menuItems.push({
      label: 'Remover Liderança',
      onClick: onDemote,
      icon: <Star className="w-4 h-4" />,
    })
  }

  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar src={member.avatar} name={member.name} size="md" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-dark-900 dark:text-dark-50 truncate">
            {member.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isLeader ? 'Líder da Equipe' : 'Membro'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-green-500" strokeWidth={3} />
        </div>
        <ItemMenuDropdown menuItems={menuItems} onDelete={onDelete} />
      </div>
    </div>
  )
}
