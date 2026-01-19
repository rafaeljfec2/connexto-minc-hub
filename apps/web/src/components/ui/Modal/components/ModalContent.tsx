import type { ReactNode } from 'react'

interface ModalContentProps {
  readonly children: ReactNode
}

export function ModalContent({ children }: ModalContentProps) {
  return (
    <div className="p-4 pb-4 sm:p-6 sm:pb-6 flex-1 min-h-0 flex flex-col overflow-hidden">
      {children}
    </div>
  )
}
