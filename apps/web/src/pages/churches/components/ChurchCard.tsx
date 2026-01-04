import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Church } from '@/types'
import { EditIcon, TrashIcon, MailIcon, PhoneIcon } from '@/components/icons'

interface ChurchCardProps {
  readonly church: Church
  readonly onEdit: (church: Church) => void
  readonly onDelete: (id: string) => void
  readonly isUpdating: boolean
  readonly isDeleting: boolean
}

export function ChurchCard({
  church,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}: ChurchCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2 truncate">
              {church.name}
            </h3>
            {church.address && (
              <p className="text-sm text-dark-600 dark:text-dark-400 mb-2">
                {church.address}
              </p>
            )}
            {church.email && (
              <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400 mb-1">
                <MailIcon className="h-4 w-4" />
                <span className="truncate">{church.email}</span>
              </div>
            )}
            {church.phone && (
              <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                <PhoneIcon className="h-4 w-4" />
                <span>{church.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-dark-200 dark:border-dark-800">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(church)}
            disabled={isUpdating}
            className="flex-1"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(church.id)}
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
