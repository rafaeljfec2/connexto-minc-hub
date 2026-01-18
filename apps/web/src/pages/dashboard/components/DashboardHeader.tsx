import { User } from '@minc-hub/shared/types'

interface DashboardHeaderProps {
  readonly user: User | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-50 mb-2">Dashboard</h1>
      <p className="text-dark-600 dark:text-dark-400">Bem-vindo, {user?.name ?? 'Usuário'}</p>
    </div>
  )
}
