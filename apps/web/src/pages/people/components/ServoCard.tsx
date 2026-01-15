import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Person, Ministry, Team, TeamMember, MemberType } from '@minc-hub/shared/types'
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
  readonly onSendWhatsApp?: (person: Person) => void
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
  onSendWhatsApp,
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
                'dark:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500/30'
              )}
            >
              {ministry.name}
            </span>
          )}
          {/* Display all teams from teamMembers */}
          {person.teamMembers && person.teamMembers.length > 0 ? (
            person.teamMembers.map((teamMember: TeamMember) => {
              const teamName = teamMember.team?.name ?? 'Equipe desconhecida'
              const isFixed = teamMember.memberType === MemberType.FIXED
              return (
                <span
                  key={teamMember.id}
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    isFixed
                      ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                      : 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30'
                  )}
                  title={isFixed ? 'Membro fixo' : 'Ajuda eventual'}
                >
                  {teamName}
                  {!isFixed && <span className="ml-1 text-[10px] opacity-75">(eventual)</span>}
                </span>
              )
            })
          ) : team ? (
            // Fallback to legacy teamId if teamMembers is not available
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                'bg-blue-500/10 text-blue-600 border-blue-500/20',
                'dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
              )}
            >
              {team.name}
            </span>
          ) : (
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                'bg-dark-200 text-dark-600 border-dark-300',
                'dark:bg-dark-800 dark:text-dark-400 dark:border-dark-700'
              )}
            >
              Sem time/equipe
            </span>
          )}
          {hasUser && <StatusBadge status="active">Usuário Ativo</StatusBadge>}
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
          {onSendWhatsApp && person.phone && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSendWhatsApp(person)}
              disabled={isUpdating}
              className="flex items-center gap-1.5"
              title="Enviar código de acesso via WhatsApp"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>
          )}
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
