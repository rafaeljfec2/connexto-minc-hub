import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { QRCodeSVG } from 'qrcode.react'
import { useCheckIn } from '@/hooks/useCheckIn'
import { Html5Qrcode } from 'html5-qrcode'
import type { Attendance } from '@minc-hub/shared/types'

type Mode = 'scan' | 'generate'

export default function CheckinPage() {
  const { user } = useAuth()
  const [mode, setMode] = useState<Mode>('generate')
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const scannerRef = useRef<HTMLDivElement>(null)
  const { generateQrCode, validateQrCode, fetchHistory, qrCode, qrCodeData, history, isLoading } =
    useCheckIn()

  // Generate QR Code on mount and when mode changes to generate
  useEffect(() => {
    if (mode === 'generate' && !qrCode) {
      generateQrCode()
    }
  }, [mode, qrCode, generateQrCode])

  // Fetch history on mount
  useEffect(() => {
    fetchHistory(20)
  }, [fetchHistory])

  // Initialize and start scanner when mode changes to scan
  useEffect(() => {
    let currentScanner: Html5Qrcode | null = null
    let mounted = true

    if (mode === 'scan') {
      const initScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode('qr-reader')
          currentScanner = html5QrCode
          if (mounted) {
            setScanner(html5QrCode)
            await startScanningWithScanner(html5QrCode)
          }
        } catch (error) {
          console.error('Error initializing scanner:', error)
        }
      }

      initScanner()
    }

    return () => {
      mounted = false
      if (currentScanner) {
        currentScanner
          .stop()
          .then(() => {
            currentScanner?.clear()
          })
          .catch(() => {
            // Ignore errors on cleanup
          })
      }
    }
  }, [mode])

  async function startScanningWithScanner(html5QrCode: Html5Qrcode) {
    try {
      setIsScanning(true)
      setScanError(null)

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanError,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao iniciar câmera'
      setScanError(message)
      setIsScanning(false)
    }
  }


  async function stopScanning() {
    if (!scanner) return

    try {
      await scanner.stop()
      scanner.clear()
      setIsScanning(false)
    } catch (error) {
      // Ignore errors on stop
    }
  }

  async function onScanSuccess(decodedText: string) {
    if (!decodedText || !scanner) return

    try {
      // Stop scanning temporarily
      await scanner.stop()
      setIsScanning(false)

      // Validate QR Code
      const attendance = await validateQrCode(decodedText)

      if (attendance) {
        // Refresh history
        await fetchHistory(20)

        // Resume scanning after 2 seconds
        if (mode === 'scan' && scanner) {
          setTimeout(() => {
            startScanningWithScanner(scanner!)
          }, 2000)
        }
      } else {
        // Resume scanning if validation failed
        if (mode === 'scan' && scanner) {
          setTimeout(() => {
            startScanningWithScanner(scanner!)
          }, 1000)
        }
      }
    } catch (error) {
      // Resume scanning on error
      if (mode === 'scan' && scanner) {
        setTimeout(() => {
          startScanningWithScanner(scanner!)
        }, 1000)
      }
    }
  }

  function onScanError(errorMessage: string) {
    // Ignore most errors, only show critical ones
    if (errorMessage.includes('No MultiFormat Readers')) {
      setScanError('Câmera não disponível')
    }
  }

  async function handleModeChange(newMode: Mode) {
    if (newMode === 'generate' && mode === 'scan') {
      // Stop scanning
      if (scanner) {
        await stopScanning()
        setScanner(null)
      }
    }
    setMode(newMode)
  }

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto pb-20 pt-4">
          <div className="px-4 mb-4">
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-1">Check-in</h1>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              {mode === 'generate'
                ? 'Gere seu QR Code para check-in'
                : 'Escaneie o QR code para registrar presença'}
            </p>
          </div>

          {/* Toggle Segments */}
          <div className="px-4 mb-4">
            <div className="flex bg-dark-900 dark:bg-dark-900 rounded-xl p-1 border border-dark-800">
              <button
                type="button"
                onClick={() => handleModeChange('generate')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'generate'
                    ? 'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 font-bold'
                    : 'text-dark-400 dark:text-dark-400'
                }`}
              >
                Meu Código
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('scan')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'scan'
                    ? 'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 font-bold'
                    : 'text-dark-400 dark:text-dark-400'
                }`}
              >
                Ler Código
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-4">
            {mode === 'generate' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center min-h-[400px]">
                  <Card className="w-full max-w-sm p-8">
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-1">
                        Meu Código de Check-in
                      </h2>
                      <p className="text-sm text-dark-600 dark:text-dark-400 mb-8">
                        Apresente este código para leitura
                      </p>

                      {isLoading ? (
                        <div className="flex items-center justify-center h-[200px]">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
                        </div>
                      ) : qrCode ? (
                        <>
                          <div className="bg-white p-6 rounded-2xl border border-dark-200 dark:border-dark-800 mb-8 flex justify-center">
                            <QRCodeSVG value={qrCode} size={200} />
                          </div>
                          {qrCodeData?.expiresAt && (
                            <p className="text-xs text-dark-500 dark:text-dark-400 mb-4">
                              Expira em:{' '}
                              {new Date(qrCodeData.expiresAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="bg-dark-100 dark:bg-dark-800 p-6 rounded-2xl mb-8">
                          <p className="text-sm text-dark-600 dark:text-dark-400">
                            Não há agenda para hoje
                          </p>
                        </div>
                      )}

                      <div className="text-center">
                        <p className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-1">
                          {user?.name || 'Usuário'}
                        </p>
                        <p className="text-sm font-medium text-primary-500 dark:text-primary-400">
                          Membro
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* History */}
                {history.length > 0 && (
                  <Card className="p-4">
                    <h3 className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-4">
                      Histórico Recente
                    </h3>
                    <div className="space-y-2">
                      {history.slice(0, 5).map(attendance => (
                        <div
                          key={attendance.id}
                          className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-900 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-dark-900 dark:text-dark-50">
                              {new Date(attendance.checkedInAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-dark-600 dark:text-dark-400">
                              {new Date(attendance.checkedInAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <p className="text-xs font-medium text-green-700 dark:text-green-400">
                              Presente
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-sm p-8">
                  <div className="text-center">
                    <div ref={scannerRef} className="relative mb-6">
                      <div id="qr-reader" className="w-full" />
                      {scanError && (
                        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <p className="text-sm text-red-700 dark:text-red-400">{scanError}</p>
                        </div>
                      )}
                      {!isScanning && !scanError && (
                        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            Iniciando câmera...
                          </p>
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <main className="hidden lg:block container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Check-in" description="Gere ou escaneie QR codes para check-in" />
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generate QR Code */}
          <Card className="p-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-1">
                Meu Código de Check-in
              </h2>
              <p className="text-sm text-dark-600 dark:text-dark-400 mb-8">
                Apresente este código para leitura
              </p>

              {isLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
                </div>
              ) : qrCode ? (
                <>
                  <div className="bg-white p-6 rounded-2xl border border-dark-200 dark:border-dark-800 mb-8 flex justify-center">
                    <QRCodeSVG value={qrCode} size={200} />
                  </div>
                  {qrCodeData?.expiresAt && (
                    <p className="text-xs text-dark-500 dark:text-dark-400 mb-4">
                      Expira em:{' '}
                      {new Date(qrCodeData.expiresAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </>
              ) : (
                <div className="bg-dark-100 dark:bg-dark-800 p-6 rounded-2xl mb-8">
                  <p className="text-sm text-dark-600 dark:text-dark-400">
                    Não há agenda para hoje
                  </p>
                </div>
              )}

              <div className="text-center">
                <p className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-1">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-sm font-medium text-primary-500 dark:text-primary-400">Membro</p>
              </div>
            </div>
          </Card>

          {/* Scan QR Code */}
          <Card className="p-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-1">
                Ler QR Code
              </h2>
              <p className="text-sm text-dark-600 dark:text-dark-400 mb-8">
                Escaneie o QR code para registrar check-in
              </p>

              <div ref={scannerRef}>
                <div id="qr-reader" className="w-full" />
                {scanError && (
                  <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">{scanError}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-4">
                Histórico de Check-ins
              </h3>
              <div className="space-y-2">
                {history.map(attendance => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-900 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-dark-900 dark:text-dark-50">
                        {new Date(attendance.checkedInAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-dark-600 dark:text-dark-400">
                        {new Date(attendance.checkedInAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <p className="text-xs font-medium text-green-700 dark:text-green-400">
                        Presente
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
