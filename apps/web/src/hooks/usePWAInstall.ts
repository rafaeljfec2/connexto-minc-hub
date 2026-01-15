import { useState, useEffect, useCallback } from 'react'
import { isStandalone } from '../utils/pwa'
import { logger } from '../lib/logger'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Hook para gerenciar instalação PWA
 * Detecta o evento beforeinstallprompt e fornece função para instalar o app
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    setIsInstalled(isStandalone())

    // Detectar evento beforeinstallprompt (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir o prompt padrão do navegador
      e.preventDefault()

      // Armazenar o evento para uso posterior
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)

      logger.debug('beforeinstallprompt event captured', 'PWA-Install')
    }

    // Detectar quando o app é instalado
    const handleAppInstalled = () => {
      logger.info('App instalado', 'PWA-Install')
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    if (globalThis.window !== undefined) {
      // Adicionar listeners
      globalThis.window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt, {
        passive: false,
      })
      globalThis.window.addEventListener('appinstalled', handleAppInstalled)

      return () => {
        globalThis.window?.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        globalThis.window?.removeEventListener('appinstalled', handleAppInstalled)
      }
    }
  }, [])

  /**
   * Instala o app PWA
   * Retorna true se a instalação foi iniciada com sucesso
   */
  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      // Não logar warning - é esperado que o prompt ainda não esteja disponível
      // quando o modal aparece antes do evento beforeinstallprompt
      return false
    }

    try {
      // Mostrar o prompt de instalação
      await deferredPrompt.prompt()

      // Aguardar a escolha do usuário
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        logger.info('Usuário aceitou a instalação', 'PWA-Install', { outcome })
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      } else {
        logger.info('Usuário rejeitou a instalação', 'PWA-Install', { outcome })
        return false
      }
    } catch (error) {
      logger.error('Erro ao instalar app', 'PWA-Install', error)
      return false
    }
  }, [deferredPrompt])

  return {
    install,
    isInstallable,
    isInstalled,
    canInstall: deferredPrompt !== null && !isInstalled,
  }
}
