import type { Person, Ministry, Team } from '@minc-hub/shared/types'
import { CompactListItem } from '@/components/ui/CompactListItem'

interface PeopleListItemProps {
  readonly person: Person
  readonly ministry?: Ministry
  readonly team?: Team
  readonly onEdit?: (person: Person) => void
  readonly onDelete?: (id: string) => void
  readonly onCreateUser?: (person: Person) => void
  readonly hasUser?: boolean
  readonly onClick?: (person: Person) => void
}

export function PeopleListItem({
  person,
  ministry,
  team,
  onEdit,
  onDelete,
  onCreateUser,
  hasUser,
  onClick,
}: PeopleListItemProps) {
  return (
    <CompactListItem
      icon={
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
          {person.name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </div>
      }
      title={person.name}
      subtitle={ministry?.name}
      metadata={team?.name}
      badge={hasUser ? { text: 'Usuário', variant: 'success' } : undefined}
      onClick={() => onClick?.(person)}
      onEdit={onEdit ? () => onEdit(person) : undefined}
      onDelete={onDelete ? () => onDelete(person.id) : undefined}
      menuItems={
        !hasUser && onCreateUser
          ? [
              {
                label: 'Criar Usuário',
                onClick: () => onCreateUser(person),
                icon: (
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                ),
              },
            ]
          : undefined
      }
    />
  )
}
