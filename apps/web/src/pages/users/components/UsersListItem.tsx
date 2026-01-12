import { User, UserRole } from '@minc-hub/shared/types'
import { CompactListItem } from '@/components/ui/CompactListItem'
import { getRoleLabel } from '@/lib/userUtils'

interface UsersListItemProps {
  readonly user: User
  readonly personName?: string
  readonly onEdit: (user: User) => void
  readonly onDelete: (id: string) => void
}

export function UsersListItem({ user, personName, onEdit, onDelete }: UsersListItemProps) {
  // Initials for Avatar
  const initials = user.name
    .split(' ')
    .filter((_, i) => i < 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()

  const avatar = (
    <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">{initials}</span>
  )

  let badgeVariant: 'success' | 'warning' | 'error' | 'info' | 'default' = 'default'
  if (user.role === UserRole.ADMIN) badgeVariant = 'error'
  else if (user.role === UserRole.LIDER_DE_TIME || user.role === UserRole.LIDER_DE_EQUIPE)
    badgeVariant = 'info'
  else if (user.role === UserRole.PASTOR) badgeVariant = 'warning'

  return (
    <CompactListItem
      icon={avatar}
      title={user.name}
      subtitle={user.email}
      badge={{
        text: getRoleLabel(user.role),
        variant: badgeVariant,
      }}
      metadata={personName ? `Vinculado a: ${personName}` : 'Não vinculado'}
      onEdit={() => onEdit(user)}
      onDelete={() => onDelete(user.id)}
      stacked
    />
  )
}
