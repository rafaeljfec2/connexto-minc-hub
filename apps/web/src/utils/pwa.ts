/**
 * PWA Utilities
 * Funções para gerenciar Service Worker e funcionalidades PWA
 */

import { logger } from '../lib/logger'

export interface ServiceWorkerRegistrationState {
  registration: globalThis.ServiceWorkerRegistration | null
  updateAvailable: boolean
  updateError: Error | null
}

let registrationInstance: ServiceWorkerRegistrationState | null = null
let updateAvailableCallback: (() => void) | null = null

/**
 * Registra o Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistrationState | null> {
  if (globalThis.window === undefined || !('serviceWorker' in navigator)) {
    logger.warn('Service Workers não são suportados neste navegador', 'PWA')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    })

    logger.info('Service Worker registrado com sucesso', 'PWA', { scope: registration.scope })

    // Verificar atualizações periodicamente
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      logger.debug('Nova versão do Service Worker encontrada', 'PWA')

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Nova versão instalada, mas ainda não ativa
          logger.info('Nova versão disponível. Recarregue a página para atualizar.', 'PWA')
          if (updateAvailableCallback) {
            updateAvailableCallback()
          }
        }
      })
    })

    // Escutar mensagens do Service Worker
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data?.type === 'SW_UPDATED') {
        logger.info('Service Worker atualizado', 'PWA')
        if (updateAvailableCallback) {
          updateAvailableCallback()
        }
      }
    })

    registrationInstance = {
      registration,
      updateAvailable: false,
      updateError: null,
    }

    return registrationInstance
  } catch (error) {
    logger.error('Erro ao registrar Service Worker', 'PWA', error)
    return null
  }
}

/**
 * Verifica se há atualização disponível do Service Worker
 */
export async function checkForUpdates(): Promise<boolean> {
  const registration = registrationInstance?.registration
  if (!registration) {
    return false
  }

  try {
    await registration.update()
    return true
  } catch (error) {
    logger.error('Erro ao verificar atualizações', 'PWA', error)
    return false
  }
}

/**
 * Força atualização do Service Worker
 */
export async function forceUpdate(): Promise<void> {
  const registration = registrationInstance?.registration
  if (!registration) {
    return
  }

  try {
    const worker = registration.waiting

    if (worker) {
      // Enviar mensagem para o worker pular espera
      worker.postMessage({ type: 'SKIP_WAITING' })

      // Recarregar página após atualização
      globalThis.window.location.reload()
    } else {
      // Tentar atualizar normalmente
      await registration.update()
    }
  } catch (error) {
    logger.error('Erro ao forçar atualização', 'PWA', error)
  }
}

/**
 * Define callback para quando atualização estiver disponível
 */
export function onUpdateAvailable(callback: () => void): void {
  updateAvailableCallback = callback
}

/**
 * Verifica se o app está rodando em modo standalone (instalado)
 */
export function isStandalone(): boolean {
  if (globalThis.window === undefined) {
    return false
  }

  // iOS Safari
  if ((globalThis.window.navigator as { standalone?: boolean }).standalone === true) {
    return true
  }

  // Android Chrome
  if (globalThis.window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }

  // Outros navegadores
  if (globalThis.document.referrer.includes('android-app://')) {
    return true
  }

  return false
}

/**
 * Verifica se Service Workers são suportados
 */
export function isServiceWorkerSupported(): boolean {
  return globalThis.window !== undefined && 'serviceWorker' in navigator
}

/**
 * Obtém a instância de registro do Service Worker
 */
export function getServiceWorkerRegistration(): ServiceWorkerRegistrationState | null {
  return registrationInstance
}
