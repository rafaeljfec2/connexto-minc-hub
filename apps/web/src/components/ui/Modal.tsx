import { ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: Readonly<ModalProps>) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-[101] w-full bg-white border border-dark-200 shadow-xl',
          'dark:bg-dark-900 dark:border-dark-800',
          'flex flex-col',
          // Mobile: full width bottom sheet with safe area
          'max-h-[75vh] rounded-t-3xl sm:rounded-xl',
          'animate-slide-up sm:animate-scale-in',
          // Desktop: centered modal
          'sm:max-h-[90vh]',
          sizeClasses[size]
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-dark-900 dark:text-dark-50">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-50 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Fechar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 pb-20 flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
