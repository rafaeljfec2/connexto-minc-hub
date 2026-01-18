import { Check } from 'lucide-react'
import { Person } from '@minc-hub/shared/types'
import { Avatar } from '@/components/ui/Avatar'
import { ItemMenuDropdown } from '@/components/ui/ItemMenuDropdown'

interface MemberItemProps {
  readonly member: Person
  readonly onDelete: () => void
}

export function MemberItem({ member, onDelete }: MemberItemProps) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar src={member.avatar} name={member.name} size="md" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-dark-900 dark:text-dark-50 truncate">
            {member.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Membro</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-green-500" strokeWidth={3} />
        </div>
        <ItemMenuDropdown onDelete={onDelete} />
      </div>
    </div>
  )
}
