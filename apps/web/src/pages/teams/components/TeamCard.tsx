import { UserPlus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Team } from '@minc-hub/shared/types'
import { EditIcon, TrashIcon } from '@/components/icons'
import { ItemMenuDropdown, type MenuItem } from '@/components/ui/ItemMenuDropdown'

interface TeamCardProps {
  readonly team: Team
  readonly ministryName?: string
  readonly onEdit: (team: Team) => void
  readonly onDelete: (id: string) => void
  readonly onAddMember?: (team: Team) => void
  readonly onClick?: (team: Team) => void
  readonly isUpdating: boolean
  readonly isDeleting: boolean
}

export function TeamCard({
  team,
  ministryName,
  onEdit,
  onDelete,
  onAddMember,
  onClick,
  isUpdating,
  isDeleting,
}: TeamCardProps) {
  const menuItems: MenuItem[] = []
  if (onAddMember) {
    menuItems.push({
      label: 'Adicionar Membro',
      onClick: () => onAddMember(team),
      icon: <UserPlus className="w-4 h-4" />,
    })
  }

  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.(team)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2 truncate">
              {team.name}
            </h3>
            {team.description && (
              <p className="text-sm text-dark-600 dark:text-dark-400 mb-2 line-clamp-2">
                {team.description}
              </p>
            )}
            {ministryName && (
              <p className="text-sm text-dark-500 dark:text-dark-500 mb-1">{ministryName}</p>
            )}
            <p className="text-sm text-dark-500 dark:text-dark-500">
              {team.memberIds?.length ?? 0} membro{(team.memberIds?.length ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
          <div onClick={e => e.stopPropagation()} className="flex-shrink-0">
            <ItemMenuDropdown
              onEdit={() => onEdit(team)}
              onDelete={() => onDelete(team.id)}
              menuItems={menuItems}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <StatusBadge status={team.isActive ? 'active' : 'inactive'}>
            {team.isActive ? 'Ativa' : 'Inativa'}
          </StatusBadge>
        </div>

        <div
          className="flex gap-2 pt-4 border-t border-dark-200 dark:border-dark-800"
          onClick={e => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(team)}
            disabled={isUpdating}
            className="flex-1"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(team.id)}
            disabled={isDeleting}
            className="px-3"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
