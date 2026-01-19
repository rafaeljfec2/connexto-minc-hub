import type { ReactNode } from 'react'
import { useModalBodyLock, useModalSafetyRestore } from './hooks/useModalBodyLock'
import { useModalKeyboard } from './hooks/useModalKeyboard'
import { ModalBackdrop } from './components/ModalBackdrop'
import { ModalContainer } from './components/ModalContainer'
import { ModalHeader } from './components/ModalHeader'
import { ModalContent } from './components/ModalContent'
import type { ModalSize } from './utils/modalSizes'

interface ModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly title: string
  readonly children: ReactNode
  readonly size?: ModalSize
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useModalBodyLock(isOpen)
  useModalSafetyRestore(isOpen)
  useModalKeyboard(isOpen, onClose)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <ModalBackdrop onClose={onClose} />
      <ModalContainer size={size}>
        <ModalHeader title={title} onClose={onClose} />
        <ModalContent>{children}</ModalContent>
      </ModalContainer>
    </div>
  )
}
