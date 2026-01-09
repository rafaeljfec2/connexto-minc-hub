import type { ReactNode } from 'react'

interface ProfileSectionProps {
  title: string
  description?: string
  children: ReactNode
}

export function ProfileSection({ title, description, children }: ProfileSectionProps) {
  return (
    <div className="bg-white dark:bg-dark-900 rounded-xl border border-dark-200 dark:border-dark-800 p-6 lg:p-8 transition-all hover:shadow-md">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50">{title}</h3>
        {description && (
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
