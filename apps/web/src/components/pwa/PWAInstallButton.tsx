import { Download } from 'lucide-react'
import { Button } from '../ui/Button'
import { usePWAInstall } from '../../hooks/usePWAInstall'

interface PWAInstallButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onInstallComplete?: () => void
}

/**
 * Botão para instalar o app PWA
 * Aparece apenas quando a instalação está disponível
 */
export function PWAInstallButton({
  className,
  variant = 'primary',
  size = 'md',
  onInstallComplete,
}: PWAInstallButtonProps) {
  const { install, canInstall, isInstalled } = usePWAInstall()

  // Não renderizar se já estiver instalado ou não puder instalar
  if (isInstalled || !canInstall) {
    return null
  }

  const handleInstall = async () => {
    const success = await install()
    if (success && onInstallComplete) {
      onInstallComplete()
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleInstall}
      className={className}
      aria-label="Instalar aplicativo"
    >
      <Download className="mr-2 h-4 w-4" />
      Instalar App
    </Button>
  )
}
