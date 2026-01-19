import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { ModalSize } from '../utils/modalSizes'
import { MODAL_SIZE_CLASSES } from '../utils/modalSizes'

interface ModalContainerProps {
  readonly size: ModalSize
  readonly children: ReactNode
}

export function ModalContainer({ size, children }: ModalContainerProps) {
  return (
    <div
      className={cn(
        'relative z-[101] w-full bg-white border border-dark-200 shadow-xl',
        'dark:bg-dark-900 dark:border-dark-800',
        'flex flex-col',
        // Mobile: full width bottom sheet with safe area
        'max-h-[80vh] rounded-t-3xl sm:rounded-xl',
        'animate-slide-up sm:animate-scale-in',
        // Desktop: centered modal
        'sm:max-h-[90vh]',
        MODAL_SIZE_CLASSES[size]
      )}
    >
      {children}
    </div>
  )
}
