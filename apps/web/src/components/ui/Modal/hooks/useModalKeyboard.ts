import { useEffect } from 'react'

/**
 * Hook para gerenciar eventos de teclado do modal (ESC para fechar)
 */
export function useModalKeyboard(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])
}
