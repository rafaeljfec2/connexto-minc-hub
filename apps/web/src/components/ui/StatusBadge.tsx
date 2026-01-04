import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'active' | 'inactive' | 'success' | 'error' | 'warning'
  children: React.ReactNode
}

const statusStyles = {
  active: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  inactive: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  success: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
}

export function StatusBadge({ status, children, className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusStyles[status],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
