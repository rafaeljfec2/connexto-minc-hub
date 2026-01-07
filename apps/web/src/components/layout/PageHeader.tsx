import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function PageHeader({ description, action, icon }: Readonly<PageHeaderProps>) {
  return (
    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">{icon && <div>{icon}</div>}</div>
        {description && <p className="text-sm text-dark-600 dark:text-dark-400">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
