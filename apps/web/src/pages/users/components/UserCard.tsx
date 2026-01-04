import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User } from '@/types'
import { EditIcon, TrashIcon, MailIcon, UserIcon } from '@/components/icons'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { cn } from '@/lib/utils'
import { getRoleLabel, getRoleColor } from '@/lib/userUtils'

interface UserCardProps {
  readonly user: User
  readonly onEdit: (user: User) => void
  readonly onDelete: (id: string) => void
  readonly isUpdating: boolean
  readonly isDeleting: boolean
}

export function UserCard({
  user,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}: UserCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                <UserIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 truncate">
                {user.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400 mb-2">
              <MailIcon className="h-4 w-4" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getRoleColor(user.role)
                )}
              >
                {getRoleLabel(user.role)}
              </span>
              {user.personId && (
                <StatusBadge status="active">Vinculado</StatusBadge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-dark-200 dark:border-dark-800">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(user)}
            disabled={isUpdating}
            className="flex-1"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(user.id)}
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
