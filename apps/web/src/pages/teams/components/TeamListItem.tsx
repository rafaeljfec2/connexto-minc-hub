import { UserPlus } from 'lucide-react'
import type { Team } from '@minc-hub/shared/types'
import { CompactListItem } from '@/components/ui/CompactListItem'
import type { MenuItem } from '@/components/ui/ItemMenuDropdown'

interface TeamListItemProps {
  readonly team: Team
  readonly ministryName: string
  readonly onEdit?: (team: Team) => void
  readonly onDelete?: (team: Team) => void
  readonly onClick?: (team: Team) => void
  readonly onAddMember?: (team: Team) => void
}

export function TeamListItem({
  team,
  ministryName,
  onEdit,
  onDelete,
  onClick,
  onAddMember,
}: TeamListItemProps) {
  const memberCount = team.memberIds?.length ?? 0

  const menuItems: MenuItem[] = []
  if (onAddMember) {
    menuItems.push({
      label: 'Adicionar Membro',
      onClick: () => onAddMember(team),
      icon: <UserPlus className="w-4 h-4" />,
    })
  }

  return (
    <CompactListItem
      icon={
        <svg
          className="w-5 h-5 text-primary-600 dark:text-primary-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      }
      title={team.name}
      subtitle={ministryName}
      metadata={
        memberCount > 0 ? `${memberCount} ${memberCount === 1 ? 'membro' : 'membros'}` : undefined
      }
      badge={team.isActive ? { text: 'Ativa', variant: 'success' } : undefined}
      onClick={() => onClick?.(team)}
      onEdit={onEdit ? () => onEdit(team) : undefined}
      onDelete={onDelete ? () => onDelete(team) : undefined}
      menuItems={menuItems}
    />
  )
}
