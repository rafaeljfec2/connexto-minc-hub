import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { usePWAInstall } from '../../hooks/usePWAInstall'
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
  const { install, canInstall, isInstalled } = usePWAInstall()
  const [isOpen, setIsOpen] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Não mostrar se já estiver instalado ou não puder instalar
    if (isInstalled || !canInstall) {
      return
    }

    // Verificar se o usuário já rejeitou anteriormente
    const wasDismissed = localStorage.getItem(storageKey) === 'true'
    if (wasDismissed) {
      return
    }

    // Mostrar modal após delay
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [canInstall, isInstalled, delay, storageKey])

  const handleInstall = async () => {
    setIsInstalling(true)
    const success = await install()
    setIsInstalling(false)

    if (success) {
      setIsOpen(false)
      if (onInstallComplete) {
        onInstallComplete()
      }
    }
  }

  const handleDismiss = () => {
    setIsOpen(false)
    // Marcar como rejeitado no localStorage
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
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 text-dark-400 hover:text-dark-600 dark:text-dark-500 dark:hover:text-dark-300 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          {/* App Icon */}
          <div className="mx-auto w-20 h-20 mb-4 flex items-center justify-center">
            <img
              src="/icons/icon-192x192.png"
              alt="MINC Teams"
              className="w-full h-full rounded-xl"
              onError={e => {
                // Fallback se ícone não carregar
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-2">Instale o app</h3>

          {/* App Name */}
          <p className="text-lg text-dark-700 dark:text-dark-300 mb-1">
            MINC Teams - Time Boas-Vindas
          </p>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-6">mincteams.com.br</p>

          {/* Description */}
          <p className="text-dark-600 dark:text-dark-400 mb-6 text-sm">
            Instale o app para acesso rápido e melhor experiência
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleDismiss}
              className="flex-1"
              disabled={isInstalling}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleInstall}
              className="flex-1"
              isLoading={isInstalling}
              disabled={isInstalling}
            >
              <Download className="mr-2 h-4 w-4" />
              Instalar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
