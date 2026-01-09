import { useMemo } from 'react'

interface AvatarProps {
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  isOnline?: boolean
}

export function Avatar({ name, src, size = 'md', className = '', isOnline }: AvatarProps) {
  const initials = useMemo(() => {
    return (name || 'Desconhecido')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [name])

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }

  const containerClasses = `relative flex-shrink-0 ${className}`
  const imageClasses = `${sizeClasses[size]} rounded-full object-cover shadow-sm`
  const fallbackClasses = `${sizeClasses[size]} rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-md`

  return (
    <div className={containerClasses}>
      {src ? (
        <img src={src} alt={name} className={imageClasses} />
      ) : (
        <div className={fallbackClasses}>{initials}</div>
      )}
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-900 shadow-sm" />
      )}
    </div>
  )
}
