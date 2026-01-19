import { ArrowLeft } from 'lucide-react'
import { ItemMenuDropdown } from '@/components/ui/ItemMenuDropdown'
import { UserPlus } from 'lucide-react'

interface TeamHeaderProps {
  readonly onBack: () => void
  readonly onAddMember?: () => void
}

export function TeamHeader({ onBack, onAddMember }: TeamHeaderProps) {
  return (
    <div className="px-4 pt-2 lg:pt-4 pb-2 flex items-center justify-between shrink-0">
      <button
        onClick={onBack}
        className="p-1.5 -ml-1.5 text-dark-900 dark:text-dark-50 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      {onAddMember && (
        <ItemMenuDropdown
          menuItems={[
            {
              label: 'Adicionar Membro',
              onClick: onAddMember,
              icon: <UserPlus className="w-4 h-4" />,
            },
          ]}
        />
      )}
    </div>
  )
}
