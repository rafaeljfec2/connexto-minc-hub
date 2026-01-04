import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Ministry } from '@/types'
import { EditIcon, TrashIcon } from '@/components/icons'

interface MinistryCardProps {
  readonly ministry: Ministry
  readonly churchName?: string
  readonly onEdit: (ministry: Ministry) => void
  readonly onDelete: (id: string) => void
  readonly isUpdating: boolean
  readonly isDeleting: boolean
}

export function MinistryCard({
  ministry,
  churchName,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}: MinistryCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2 truncate">
              {ministry.name}
            </h3>
            {ministry.description && (
              <p className="text-sm text-dark-600 dark:text-dark-400 mb-2 line-clamp-2">
                {ministry.description}
              </p>
            )}
            {churchName && (
              <p className="text-sm text-dark-500 dark:text-dark-500">
                {churchName}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <StatusBadge status={ministry.isActive ? 'active' : 'inactive'}>
            {ministry.isActive ? 'Ativo' : 'Inativo'}
          </StatusBadge>
        </div>

        <div className="flex gap-2 pt-4 border-t border-dark-200 dark:border-dark-800">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(ministry)}
            disabled={isUpdating}
            className="flex-1"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(ministry.id)}
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
