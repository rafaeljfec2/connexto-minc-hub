import { useState, useEffect, useRef } from 'react'
import { canUserCheckIn } from '@minc-hub/shared/utils'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { useCheckIn } from '@/hooks/useCheckIn'
import { useCheckInWebSocket } from '@/hooks/useCheckInWebSocket'
import { useGuestVolunteers } from '@/hooks/useGuestVolunteers'
import { useModal } from '@/hooks/useModal'
import { useQrScanner } from './checkin/hooks/useQrScanner'
import { QrCodeDisplay } from './checkin/components/QrCodeDisplay'
import { CheckInHistory } from './checkin/components/CheckInHistory'
import { QrScannerView } from './checkin/components/QrScannerView'
import { GuestVolunteerModal } from './checkin/components/GuestVolunteerModal'

type Mode = 'scan' | 'generate'

export default function CheckinPage() {
  const { user, isLoading: isLoadingUser } = useAuth()
  const [mode, setMode] = useState<Mode>('generate')
  const guestModal = useModal()

  const canScan = canUserCheckIn(user)
  const canManageVolunteers = canScan // Same permission for managing guest volunteers

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

  const { guestVolunteers, fetchGuestVolunteers, addGuestVolunteer, removeGuestVolunteer } =
    useGuestVolunteers()

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

  // Fetch guest volunteers when qrCodeData changes (schedule loaded)
  useEffect(() => {
    if (qrCodeData?.schedule?.id && canManageVolunteers) {
      fetchGuestVolunteers(qrCodeData.schedule.id)
    }
  }, [qrCodeData?.schedule?.id, canManageVolunteers, fetchGuestVolunteers])

  function handleModeChange(newMode: Mode) {
    setMode(newMode)
  }

  const handleAddGuestVolunteer = async (personId: string) => {
    if (!qrCodeData?.schedule?.id) return
    await addGuestVolunteer(qrCodeData.schedule.id, personId)
  }

  const handleRemoveGuestVolunteer = async (personId: string) => {
    if (!qrCodeData?.schedule?.id) return
    await removeGuestVolunteer(qrCodeData.schedule.id, personId)
  }

  // Get existing person IDs (from history + guest volunteers)
  const existingPersonIds = [
    ...history.map(h => h.personId),
    ...guestVolunteers.map(gv => gv.personId),
  ]

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto pb-20 pt-2">
          <div className="px-2 mb-2">
            <h1 className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-0.5">Check-in</h1>
            <p className="text-xs text-dark-600 dark:text-dark-400">
              {mode === 'generate'
                ? 'Gere seu QR Code para check-in'
                : 'Escaneie o QR code para registrar presença'}
            </p>
          </div>

          {/* Toggle Segments */}
          <div className="px-2 mb-2">
            <div className="flex bg-dark-900 dark:bg-dark-900 rounded-xl p-1 border border-dark-800">
              <button
                type="button"
                onClick={() => handleModeChange('generate')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
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
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
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
          <div className="flex-1 px-2">
            {mode === 'generate' ? (
              <div className="space-y-2">
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

                {/* Guest Volunteers Section - Mobile */}
                {canManageVolunteers && qrCodeData?.schedule && (
                  <div className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-dark-900 dark:text-dark-50">
                        Voluntários Avulsos
                      </h3>
                      <Button size="sm" onClick={guestModal.open}>
                        Adicionar
                      </Button>
                    </div>
                    {guestVolunteers.length > 0 ? (
                      <div className="space-y-2">
                        {guestVolunteers.map(gv => (
                          <div
                            key={gv.id}
                            className="flex items-center justify-between p-2 bg-dark-50 dark:bg-dark-800 rounded text-xs"
                          >
                            <span className="text-dark-900 dark:text-dark-50">
                              {gv.person?.name ?? 'Desconhecido'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveGuestVolunteer(gv.personId)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-dark-500 dark:text-dark-400">
                        Nenhum voluntário avulso
                      </p>
                    )}
                  </div>
                )}

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
          <div className="space-y-6">
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

            {/* Guest Volunteers Section */}
            {canManageVolunteers && qrCodeData?.schedule && (
              <div className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-dark-900 dark:text-dark-50">
                    Voluntários Avulsos
                  </h3>
                  <Button size="sm" onClick={guestModal.open}>
                    Adicionar
                  </Button>
                </div>
                {guestVolunteers.length > 0 ? (
                  <div className="space-y-2">
                    {guestVolunteers.map(gv => (
                      <div
                        key={gv.id}
                        className="flex items-center justify-between p-2 bg-dark-50 dark:bg-dark-800 rounded"
                      >
                        <span className="text-sm text-dark-900 dark:text-dark-50">
                          {gv.person?.name ?? 'Desconhecido'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGuestVolunteer(gv.personId)}
                          className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-dark-500 dark:text-dark-400">
                    Nenhum voluntário avulso adicionado
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Scan QR Code */}
          <QrScannerView scannerRef={scannerRef} isScanning={isScanning} scanError={scanError} />

          {/* History */}
          <CheckInHistory history={history} />
        </div>
      </main>

      {/* Guest Volunteer Modal - Only render when open to avoid unnecessary API calls */}
      {guestModal.isOpen && (
        <GuestVolunteerModal
          isOpen={guestModal.isOpen}
          onClose={guestModal.close}
          scheduleId={qrCodeData?.schedule?.id ?? ''}
          onAdd={handleAddGuestVolunteer}
          existingPersonIds={existingPersonIds}
        />
      )}
    </>
  )
}
