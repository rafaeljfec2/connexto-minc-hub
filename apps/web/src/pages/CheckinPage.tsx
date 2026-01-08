import { useState, useEffect, useRef } from 'react'
import { canUserCheckIn } from '@minc-hub/shared/utils'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { useCheckIn } from '@/hooks/useCheckIn'
import { useCheckInWebSocket } from '@/hooks/useCheckInWebSocket'
import { useQrScanner } from './checkin/hooks/useQrScanner'
import { QrCodeDisplay } from './checkin/components/QrCodeDisplay'
import { CheckInHistory } from './checkin/components/CheckInHistory'
import { QrScannerView } from './checkin/components/QrScannerView'

type Mode = 'scan' | 'generate'

export default function CheckinPage() {
  const { user, isLoading: isLoadingUser } = useAuth()
  const [mode, setMode] = useState<Mode>('generate')

  const canScan = canUserCheckIn(user)

  const {
    generateQrCode,
    validateQrCode,
    fetchHistory,
    qrCode,
    qrCodeData,
    history,
    isLoading,
    errorType,
    errorMessage,
  } = useCheckIn()

  // Refs to prevent duplicate calls
  const hasFetchedHistoryRef = useRef(false)
  const hasGeneratedQrRef = useRef(false)
  const fetchHistoryRef = useRef(fetchHistory)
  const generateQrCodeRef = useRef(generateQrCode)

  // Keep refs updated - must run before other useEffects
  useEffect(() => {
    fetchHistoryRef.current = fetchHistory
    generateQrCodeRef.current = generateQrCode
  }, [fetchHistory, generateQrCode])

  // WebSocket for real-time updates
  const { validateQrCode: validateQrCodeWS, isConnected: isWsConnected } = useCheckInWebSocket(
    _attendance => {
      // On check-in success via WebSocket - refresh history
      if (!hasFetchedHistoryRef.current) {
        hasFetchedHistoryRef.current = true
        fetchHistoryRef.current(20).finally(() => {
          // Reset after a delay to allow for future calls
          setTimeout(() => {
            hasFetchedHistoryRef.current = false
          }, 1000)
        })
      }
    },
    _attendance => {
      // On check-in notification (when someone checks you in) - refresh history
      if (!hasFetchedHistoryRef.current) {
        hasFetchedHistoryRef.current = true
        fetchHistoryRef.current(20).finally(() => {
          // Reset after a delay to allow for future calls
          setTimeout(() => {
            hasFetchedHistoryRef.current = false
          }, 1000)
        })
      }
    }
  )

  // Handle QR code validation
  const handleQrCodeScanned = async (decodedText: string) => {
    // Try WebSocket first if connected, fallback to REST
    if (isWsConnected) {
      try {
        validateQrCodeWS(decodedText)
        return
      } catch {
        // Fallback to REST if WebSocket fails
      }
    }

    // Validate QR Code via REST
    const attendance = await validateQrCode(decodedText)
    if (attendance && !hasFetchedHistoryRef.current) {
      hasFetchedHistoryRef.current = true
      await fetchHistoryRef.current(20)
      // Reset after a delay to allow for future calls
      setTimeout(() => {
        hasFetchedHistoryRef.current = false
      }, 1000)
    }
  }

  // QR Scanner hook
  const { scannerRef, isScanning, scanError } = useQrScanner({
    onScanSuccess: handleQrCodeScanned,
    enabled: mode === 'scan',
  })

  // Generate QR Code on mount and when mode changes to generate
  // Wait for user to be loaded before attempting to generate
  useEffect(() => {
    // Reset flag when mode changes away from generate
    if (mode !== 'generate') {
      hasGeneratedQrRef.current = false
      return
    }

    // If QR code already exists, don't generate again
    if (qrCode) {
      hasGeneratedQrRef.current = false
      return
    }

    // Only generate if all conditions are met
    if (
      !isLoadingUser &&
      user?.personId &&
      !hasGeneratedQrRef.current &&
      generateQrCodeRef.current
    ) {
      hasGeneratedQrRef.current = true
      generateQrCodeRef
        .current()
        .then(() => {
          hasGeneratedQrRef.current = false
        })
        .catch(() => {
          hasGeneratedQrRef.current = false
        })
    }
  }, [mode, qrCode, isLoadingUser, user?.personId])

  // Fetch history on mount (only once)
  useEffect(() => {
    if (!hasFetchedHistoryRef.current && user?.personId && !isLoadingUser) {
      hasFetchedHistoryRef.current = true
      fetchHistoryRef.current(20).finally(() => {
        // Reset after a delay to allow for future calls
        setTimeout(() => {
          hasFetchedHistoryRef.current = false
        }, 1000)
      })
    }
  }, [user?.personId, isLoadingUser])

  function handleModeChange(newMode: Mode) {
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
                disabled={!canScan}
                title={!canScan ? 'Você não tem permissão para ler códigos' : ''}
                onClick={() => handleModeChange('scan')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'scan'
                    ? 'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 font-bold'
                    : 'text-dark-400 dark:text-dark-400'
                } ${!canScan ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  <QrCodeDisplay
                    isLoading={isLoading}
                    isLoadingUser={isLoadingUser}
                    hasPersonId={!!user?.personId}
                    qrCode={qrCode}
                    qrCodeData={qrCodeData}
                    errorType={errorType}
                    errorMessage={errorMessage}
                    userName={user?.name}
                  />
                </div>

                {/* History */}
                <CheckInHistory history={history} compact />
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[400px]">
                <QrScannerView
                  scannerRef={scannerRef}
                  isScanning={isScanning}
                  scanError={scanError}
                />
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
          <QrCodeDisplay
            isLoading={isLoading}
            isLoadingUser={isLoadingUser}
            hasPersonId={!!user?.personId}
            qrCode={qrCode}
            qrCodeData={qrCodeData}
            errorType={errorType}
            errorMessage={errorMessage}
            userName={user?.name}
          />

          {/* Scan QR Code */}
          <QrScannerView scannerRef={scannerRef} isScanning={isScanning} scanError={scanError} />

          {/* History */}
          <CheckInHistory history={history} />
        </div>
      </main>
    </>
  )
}
