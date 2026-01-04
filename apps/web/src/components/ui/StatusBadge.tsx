import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'active' | 'inactive' | 'success' | 'error' | 'warning'
  children: React.ReactNode
}

const statusStyles = {
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-red-500/20 text-red-400',
  success: 'bg-green-500/20 text-green-400',
  error: 'bg-red-500/20 text-red-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
}

export function StatusBadge({
  status,
  children,
  className,
  ...props
}: StatusBadgeProps) {
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
