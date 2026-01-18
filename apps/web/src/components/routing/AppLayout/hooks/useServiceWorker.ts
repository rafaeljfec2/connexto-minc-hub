import { useEffect } from 'react'
import { registerServiceWorker } from '@/utils/pwa'
import { logger } from '@/lib/logger'

export function useServiceWorker(): void {
  useEffect(() => {
    registerServiceWorker().catch(error => {
      logger.error('Erro ao registrar Service Worker', 'AppLayout', error)
    })
  }, [])
}
