import React from 'react'
import { Card } from '@/components/ui/Card'

interface QrScannerViewProps {
  scannerRef: React.RefObject<HTMLDivElement>
  isScanning: boolean
  scanError: string | null
}

export function QrScannerView({ scannerRef, isScanning, scanError }: QrScannerViewProps) {
  return (
    <Card className="w-full max-w-sm p-8">
      <div className="text-center">
        {/* Only show title on desktop via CSS if needed, but here we can keep it generic */}
        {/* On mobile it's hidden or handled by parent layout, but let's include it for consistency or make it optional */}
        <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-1 lg:block hidden">
          Ler QR Code
        </h2>
        <p className="text-sm text-dark-600 dark:text-dark-400 mb-8 lg:block hidden">
          Escaneie o QR code para registrar check-in
        </p>

        <div ref={scannerRef} className="relative mb-6">
          <div id="qr-reader" className="w-full" />
          {scanError && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{scanError}</p>
            </div>
          )}
          {!isScanning && !scanError && (
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">Iniciando câmera...</p>
            </div>
          )}
        </div>
        <p className="text-base text-dark-900 dark:text-dark-50 mb-2">
          Posicione o QR code dentro da área
        </p>
        <p className="text-sm text-dark-600 dark:text-dark-400">
          A câmera será ativada quando você permitir o acesso
        </p>
      </div>
    </Card>
  )
}
