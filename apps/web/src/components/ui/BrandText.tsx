import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BrandTextProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function BrandText({ className, size = 'md', ...props }: BrandTextProps) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }

  return (
    <span
      className={cn('font-semibold uppercase tracking-tight', sizeClasses[size], className)}
      {...props}
    >
      <span className="text-dark-900 dark:text-white">MINC</span>
      <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-red-600 bg-clip-text text-transparent">
        {' '}Hub
      </span>
    </span>
  )
}
