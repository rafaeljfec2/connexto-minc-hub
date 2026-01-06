import { useState, useRef, useCallback, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface UseQrScannerOptions {
  onScanSuccess: (decodedText: string) => Promise<void>
  enabled?: boolean
}

export function useQrScanner({ onScanSuccess, enabled = true }: UseQrScannerOptions) {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const scannerRef = useRef<HTMLDivElement>(null)
  const isProcessingRef = useRef(false)

  const startScanning = useCallback(
    async (html5QrCode: Html5Qrcode) => {
      try {
        setIsScanning(true)
        setScanError(null)

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText: string) => {
            if (isProcessingRef.current) return

            try {
              isProcessingRef.current = true
              await html5QrCode.stop()
              setIsScanning(false)
              await onScanSuccess(decodedText)
            } catch (error) {
              console.error('Error processing QR code:', error)
            } finally {
              isProcessingRef.current = false
              // Resume scanning after processing
              if (enabled && html5QrCode) {
                setTimeout(() => {
                  startScanning(html5QrCode)
                }, 2000)
              }
            }
          },
          (errorMessage: string) => {
            // Ignore most errors, only show critical ones
            if (errorMessage.includes('No MultiFormat Readers')) {
              setScanError('Câmera não disponível')
            }
          }
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao iniciar câmera'
        setScanError(message)
        setIsScanning(false)
      }
    },
    [onScanSuccess, enabled]
  )

  const stopScanning = useCallback(async () => {
    if (!scanner) return

    try {
      await scanner.stop()
      scanner.clear()
      setIsScanning(false)
    } catch (error) {
      // Ignore errors on stop
    }
  }, [scanner])

  // Initialize scanner when enabled
  useEffect(() => {
    let currentScanner: Html5Qrcode | null = null
    let mounted = true

    if (enabled) {
      const initScanner = async () => {
        // Wait for element to be available in DOM
        await new Promise(resolve => setTimeout(resolve, 300))

        if (!mounted) return

        const element = document.getElementById('qr-reader')
        if (!element) {
          if (mounted) setScanError('Elemento da câmera não encontrado')
          return
        }

        try {
          // Cleanup existing instance if any
          try {
            const existingScanner = new Html5Qrcode('qr-reader')
            await existingScanner.clear()
          } catch {
            // Must catch if instance didn't exist
          }

          const html5QrCode = new Html5Qrcode('qr-reader')
          currentScanner = html5QrCode

          if (mounted) {
            setScanner(html5QrCode)
            await startScanning(html5QrCode)
          }
        } catch (error) {
          console.error('Error initializing scanner:', error)
          if (mounted) {
            setScanError('Erro ao inicializar scanner')
          }
        }
      }

      initScanner()
    }

    return () => {
      mounted = false
      if (currentScanner) {
        // Cleanup - safely handle both Promise and void returns from stop()
        Promise.resolve(currentScanner.stop())
          .catch(() => {
            // Ignore errors during stop
          })
          .finally(() => {
            try {
              currentScanner?.clear()
            } catch {
              // Ignore errors during clear
            }
          })
      }
    }
  }, [enabled, startScanning])

  return {
    scanner,
    isScanning,
    scanError,
    scannerRef,
    stopScanning,
  }
}
