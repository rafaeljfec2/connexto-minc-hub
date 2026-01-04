import { User } from '@/types'

interface SidebarUserInfoProps {
  readonly user: User
}

export function SidebarUserInfo({ user }: SidebarUserInfoProps) {
  return (
    <div className="p-4 border-t border-dark-200 dark:border-dark-800">
      <div className="px-4 py-2 text-sm text-dark-600 dark:text-dark-400">{user.name}</div>
    </div>
  )
}
