import { User } from '@minc-hub/shared/types'
import { UsersListItem } from './UsersListItem'

interface UsersMobileListContentProps {
  readonly users: User[]
  readonly isLoading: boolean
  readonly hasFilters: boolean
  readonly getPersonName: (personId?: string) => string
  readonly onEdit: (user: User) => void
  readonly onDelete: (id: string) => void
}

export function UsersMobileListContent({
  users,
  isLoading,
  hasFilters,
  getPersonName,
  onEdit,
  onDelete,
}: UsersMobileListContentProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-dark-500 dark:text-dark-400">
          {hasFilters
            ? 'Nenhum usuário encontrado com os filtros atuais.'
            : 'Nenhum usuário cadastrado.'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-900 rounded-lg overflow-hidden border border-dark-200 dark:border-dark-800">
      {users.map(user => (
        <UsersListItem
          key={user.id}
          user={user}
          personName={user.personId ? getPersonName(user.personId) : undefined}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
