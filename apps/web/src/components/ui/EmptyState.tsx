import { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-sm text-dark-400 mb-2">{title}</div>
      {description && (
        <div className="text-xs text-dark-500 mb-4">{description}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
