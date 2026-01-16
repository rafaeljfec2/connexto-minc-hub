import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { usePWAInstall } from '../../hooks/usePWAInstall'
import { isStandalone } from '../../utils/pwa'
import { Button } from '../ui/Button'

interface PWAInstallModalProps {
  /**
   * Delay em milissegundos antes de mostrar o modal após a página carregar
   * Padrão: 3000ms (3 segundos)
   */
  delay?: number
  /**
   * Chave para armazenar no localStorage se o usuário já rejeitou
   * Padrão: 'pwa-install-dismissed'
   */
  storageKey?: string
  /**
   * Callback quando instalação é completada
   */
  onInstallComplete?: () => void
}

const STORAGE_KEY_DEFAULT = 'pwa-install-dismissed'
const DELAY_DEFAULT = 3000

/**
 * Modal promovendo instalação do app PWA
 * Aparece automaticamente após um delay, mas apenas uma vez por sessão
 * (usa localStorage para lembrar se o usuário já rejeitou)
 */
export function PWAInstallModal({
  delay = DELAY_DEFAULT,
  storageKey = STORAGE_KEY_DEFAULT,
  onInstallComplete,
}: PWAInstallModalProps) {
  const { install, canInstall, isInstalled, isInstallable } = usePWAInstall()
  const [isOpen, setIsOpen] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [showWaitingMessage, setShowWaitingMessage] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado usando múltiplas verificações
    const checkIfInstalled = () => {
      // Verificar via hook
      if (isInstalled) {
        return true
      }
      // Verificar diretamente via isStandalone (backup)
      if (isStandalone()) {
        return true
      }
      return false
    }

    const installed = checkIfInstalled()
    if (installed) {
      setIsOpen(false)
      return
    }

    // Verificar se o usuário já clicou em "Não quero" ou se o app já foi instalado
    const storageValue = localStorage.getItem(storageKey)
    const wasDismissed = storageValue === 'true' || storageValue === 'installed'
    if (wasDismissed) {
      setIsOpen(false)
      return
    }

    // No Safari iOS, o evento beforeinstallprompt não existe
    // Não mostrar o modal automaticamente no Safari iOS, apenas quando o usuário solicitar
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    if (isIOS && isSafari) {
      // No Safari iOS, não mostrar modal automático
      // O usuário deve usar "Adicionar à Tela de Início" manualmente
      setIsOpen(false)
      return
    }

    // Só mostrar o modal quando o evento beforeinstallprompt estiver disponível
    // ou quando isInstallable for true (indica que o evento foi capturado)
    if (!isInstallable && !canInstall) {
      // Ainda não temos o evento, aguardar um pouco mais
      return
    }

    // Mostrar modal após delay apenas se o evento estiver disponível
    const timer = setTimeout(() => {
      // Verificar novamente antes de mostrar
      const stillInstalled = checkIfInstalled()
      const storageValue = localStorage.getItem(storageKey)
      const stillDismissed = storageValue === 'true' || storageValue === 'installed'

      // Só mostrar se:
      // 1. Não estiver instalado
      // 2. Não foi rejeitado ou instalado anteriormente
      // 3. O evento beforeinstallprompt está disponível (isInstallable ou canInstall)
      if (!stillInstalled && !stillDismissed && (isInstallable || canInstall)) {
        setIsOpen(true)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [isInstalled, delay, storageKey, isInstallable, canInstall])

  // Fechar modal imediatamente se o app for instalado enquanto o modal estiver aberto
  useEffect(() => {
    if (isInstalled && isOpen) {
      setIsOpen(false)
    }
  }, [isInstalled, isOpen])

  const handleInstall = async () => {
    // Não tentar instalar se não estiver disponível
    if (!canInstall) {
      // Mostrar mensagem informativa
      setShowWaitingMessage(true)
      setTimeout(() => setShowWaitingMessage(false), 3000)
      return
    }

    setIsInstalling(true)
    const success = await install()
    setIsInstalling(false)

    if (success) {
      // Marcar como instalado no localStorage para não mostrar o modal novamente
      localStorage.setItem(storageKey, 'installed')
      setIsOpen(false)
      if (onInstallComplete) {
        onInstallComplete()
      }
    }
  }

  // Atualizar quando canInstall mudar para true
  useEffect(() => {
    if (canInstall && isOpen) {
      setShowWaitingMessage(false)
    }
  }, [canInstall, isOpen])

  const handleClose = () => {
    // Apenas fecha o modal, sem marcar como dismissed
    setIsOpen(false)
  }

  const handleDismiss = () => {
    // Fecha o modal E marca como rejeitado no localStorage
    setIsOpen(false)
    localStorage.setItem(storageKey, 'true')
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-900 rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-dark-400 hover:text-dark-600 dark:text-dark-500 dark:hover:text-dark-300 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <img
              src="/minc-teams-logo.png"
              alt="MINC Teams"
              className="h-24 w-auto object-contain invert dark:invert-0"
              onError={e => {
                const target = e.target as HTMLImageElement
                target.src = '/Logo-minc.png'
                target.className = 'h-20 w-auto object-contain invert dark:invert-0'
              }}
            />
          </div>

          {/* Brand Text - "minha igreja na cidade" */}
          <div className="mb-4">
            <p className="text-lg font-semibold text-dark-900 dark:text-white uppercase tracking-tight">
              minha igreja
            </p>
            <p className="text-lg font-semibold text-dark-900 dark:text-white uppercase tracking-tight">
              na cidade
            </p>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-6">Instale o app</h3>

          {/* Description */}
          <p className="text-dark-600 dark:text-dark-400 mb-4 text-sm">
            Instale o app para acesso rápido e melhor experiência
          </p>

          {/* Waiting Message */}
          {showWaitingMessage && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Aguardando permissão do navegador... O botão será habilitado em breve.
              </p>
            </div>
          )}

          {/* Info quando não pode instalar ainda */}
          {!canInstall && !showWaitingMessage && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                O navegador está preparando a instalação. Aguarde alguns segundos...
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Ou instale manualmente: procure o ícone de instalação (➕) na barra de endereço do
                navegador.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleDismiss}
              className="flex-1"
              disabled={isInstalling}
            >
              Não quero
            </Button>
            <Button
              variant="primary"
              onClick={handleInstall}
              className="flex-1"
              isLoading={isInstalling}
              disabled={isInstalling || !canInstall}
            >
              <Download className="mr-2 h-4 w-4" />
              {canInstall ? 'Instalar' : 'Aguardando...'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
