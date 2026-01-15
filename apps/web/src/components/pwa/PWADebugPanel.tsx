import { useState, useEffect } from 'react'
import { usePWAInstall } from '../../hooks/usePWAInstall'
import { isStandalone, isServiceWorkerSupported } from '../../utils/pwa'

/**
 * Painel de debug para PWA
 * Use apenas em desenvolvimento ou para troubleshooting
 */
export function PWADebugPanel() {
  const { install, canInstall, isInstallable, isInstalled } = usePWAInstall()
  const [swStatus, setSwStatus] = useState<string>('Verificando...')
  const [manifestStatus, setManifestStatus] = useState<string>('Verificando...')

  useEffect(() => {
    // Verificar Service Worker
    if (isServiceWorkerSupported()) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          setSwStatus(`✅ Ativo (${reg.scope})`)
        } else {
          setSwStatus('❌ Não registrado')
        }
      })
    } else {
      setSwStatus('❌ Não suportado')
    }

    // Verificar Manifest
    fetch('/manifest.webmanifest')
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        throw new Error('Manifest não encontrado')
      })
      .then(manifest => {
        setManifestStatus(`✅ OK (${manifest.name})`)
      })
      .catch(err => {
        setManifestStatus(`❌ Erro: ${err.message}`)
      })
  }, [])

  const handleTestInstall = async () => {
    const result = await install()
    alert(result ? 'Instalação iniciada!' : 'Instalação não disponível')
  }

  const handleClearDismissed = () => {
    localStorage.removeItem('pwa-install-dismissed')
    alert('Cache limpo! Recarregue a página.')
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg shadow-xl p-4 max-w-sm z-50">
      <h3 className="font-bold text-sm mb-3 text-dark-900 dark:text-dark-50">🔧 PWA Debug Panel</h3>

      <div className="space-y-2 text-xs">
        <div>
          <strong>Service Worker:</strong> {swStatus}
        </div>
        <div>
          <strong>Manifest:</strong> {manifestStatus}
        </div>
        <div>
          <strong>Standalone:</strong> {isStandalone() ? '✅ Sim' : '❌ Não'}
        </div>
        <div>
          <strong>Pode Instalar:</strong> {canInstall ? '✅ Sim' : '❌ Não'}
        </div>
        <div>
          <strong>Instalável:</strong> {isInstallable ? '✅ Sim' : '❌ Não'}
        </div>
        <div>
          <strong>Já Instalado:</strong> {isInstalled ? '✅ Sim' : '❌ Não'}
        </div>
        <div>
          <strong>Dismissed:</strong>{' '}
          {localStorage.getItem('pwa-install-dismissed') === 'true' ? '✅ Sim' : '❌ Não'}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={handleTestInstall}
          disabled={!canInstall}
          className="w-full px-3 py-2 bg-primary-600 text-white rounded text-xs hover:bg-primary-700 disabled:opacity-50"
        >
          Testar Instalação
        </button>
        <button
          onClick={handleClearDismissed}
          className="w-full px-3 py-2 bg-dark-200 dark:bg-dark-700 text-dark-900 dark:text-dark-50 rounded text-xs hover:bg-dark-300 dark:hover:bg-dark-600"
        >
          Limpar Cache Dismissed
        </button>
      </div>
    </div>
  )
}
