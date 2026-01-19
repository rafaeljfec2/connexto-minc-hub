import { useEffect } from 'react'

const SAFETY_TIMEOUT_MS = 300000 // 5 minutos

/**
 * Hook para gerenciar o bloqueio do scroll do body quando o modal está aberto
 */
export function useModalBodyLock(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow || 'unset'
      document.body.style.overflow = 'hidden'

      // Timeout de segurança para restaurar overflow caso algo dê errado
      const safetyTimeout = setTimeout(() => {
        if (document.body.style.overflow === 'hidden') {
          console.warn('Modal safety timeout: restoring body overflow')
          document.body.style.overflow = originalOverflow
        }
      }, SAFETY_TIMEOUT_MS)

      return () => {
        clearTimeout(safetyTimeout)
        document.body.style.overflow = originalOverflow
      }
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
}

/**
 * Hook para garantir que o overflow seja sempre restaurado em eventos globais
 */
export function useModalSafetyRestore(isOpen: boolean) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isOpen) {
        document.body.style.overflow = 'unset'
      }
    }

    const handleBeforeUnload = () => {
      document.body.style.overflow = 'unset'
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    globalThis.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      globalThis.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isOpen])
}
