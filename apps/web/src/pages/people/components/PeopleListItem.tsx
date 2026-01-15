import type { Person, Ministry, Team } from '@minc-hub/shared/types'
import { CompactListItem } from '@/components/ui/CompactListItem'

interface PeopleListItemProps {
  readonly person: Person
  readonly ministry?: Ministry
  readonly team?: Team
  readonly onEdit?: (person: Person) => void
  readonly onDelete?: (id: string) => void
  readonly onCreateUser?: (person: Person) => void
  readonly onSendWhatsApp?: (person: Person) => void
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
  onSendWhatsApp,
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
      menuItems={[
        ...(onSendWhatsApp && person.phone
          ? [
              {
                label: 'Enviar WhatsApp',
                onClick: () => onSendWhatsApp(person),
                icon: (
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                ),
              },
            ]
          : []),
        ...(!hasUser && onCreateUser
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
          : []),
      ]}
    />
  )
}
