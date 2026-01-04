import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Person, Ministry, Team } from '@/types'
import { EditIcon, TrashIcon, MailIcon, PhoneIcon, UserIcon } from '@/components/icons'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { cn } from '@/lib/utils'

interface ServoCardProps {
  readonly person: Person
  readonly ministry?: Ministry
  readonly team?: Team
  readonly onEdit: (person: Person) => void
  readonly onDelete: (id: string) => void
  readonly onCreateUser?: (person: Person) => void
  readonly hasUser?: boolean
  readonly isUpdating: boolean
  readonly isDeleting: boolean
}

export function ServoCard({
  person,
  ministry,
  team,
  onEdit,
  onDelete,
  onCreateUser,
  hasUser,
  isUpdating,
  isDeleting,
}: ServoCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2 truncate">
              {person.name}
            </h3>
            {person.email && (
              <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400 mb-1">
                <MailIcon className="h-4 w-4" />
                <span className="truncate">{person.email}</span>
              </div>
            )}
            {person.phone && (
              <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                <PhoneIcon className="h-4 w-4" />
                <span>{person.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {ministry && (
            <span
              className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
              'bg-primary-500/10 text-primary-600 border-primary-500/20',
              'dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500/30',
            )}
            >
              {ministry.name}
            </span>
          )}
          {team && (
            <span
              className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
              'bg-blue-500/10 text-blue-600 border-blue-500/20',
              'dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
            )}
            >
              {team.name}
            </span>
          )}
          {!ministry && !team && (
            <span
              className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
              'bg-dark-200 text-dark-600 border-dark-300',
              'dark:bg-dark-800 dark:text-dark-400 dark:border-dark-700',
            )}
            >
              Sem time/equipe
            </span>
          )}
          {hasUser && (
            <StatusBadge status="active">Usuário Ativo</StatusBadge>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-dark-200 dark:border-dark-800">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(person)}
            disabled={isUpdating}
            className="flex-1"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Editar
          </Button>
          {onCreateUser && !hasUser && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onCreateUser(person)}
              disabled={isUpdating}
              className="flex items-center gap-1.5 whitespace-nowrap"
              title="Criar usuário para este servo"
            >
              <UserIcon className="h-4 w-4" />
              <span>Usuário</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(person.id)}
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
