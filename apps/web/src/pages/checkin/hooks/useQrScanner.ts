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

        const devices = await Html5Qrcode.getCameras()
        if (!devices || devices.length === 0) {
          throw new Error('Nenhuma câmera encontrada')
        }

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        }

        try {
          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            async (decodedText: string) => {
              if (isProcessingRef.current) return

              // Prevent double processing
              isProcessingRef.current = true

              // 1. Try to stop scanning, but don't let failure block success
              try {
                await html5QrCode.stop()
              } catch (e) {
                // Ignore "Cannot stop, scanner is not running or paused" errors
                const errorMessage = e instanceof Error ? e.message : String(e)
                if (!errorMessage.includes('not running') && !errorMessage.includes('not paused')) {
                  console.warn('Scanner stop warning:', e)
                }
              }

              setIsScanning(false)

              // 2. Proceed with success handling
              try {
                await onScanSuccess(decodedText)
              } catch (error) {
                console.error('Error processing QR code:', error)
              } finally {
                isProcessingRef.current = false
              }
            },
            () => {
              // Ignore frame errors
            }
          )
        } catch (envError) {
          console.warn('Environment camera failed, trying fallback', envError)
          // Fallback to first available camera
          const cameraId = devices[0].id
          await html5QrCode.start(
            cameraId,
            config,
            async (decodedText: string) => {
              if (isProcessingRef.current) return
              isProcessingRef.current = true

              try {
                await html5QrCode.stop()
              } catch (e) {
                // Ignore "Cannot stop, scanner is not running or paused" errors
                const errorMessage = e instanceof Error ? e.message : String(e)
                if (!errorMessage.includes('not running') && !errorMessage.includes('not paused')) {
                  console.warn('Scanner stop warning:', e)
                }
              }

              setIsScanning(false)

              try {
                await onScanSuccess(decodedText)
              } catch {
                // ignore
              } finally {
                isProcessingRef.current = false
              }
            },
            () => {}
          )
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao iniciar câmera'
        console.error('Scanner start error:', error)
        setScanError(message)
        setIsScanning(false)
      }
    },
    [onScanSuccess]
  )

  const stopScanning = useCallback(async () => {
    if (!scanner) return

    try {
      // Check if scanner is actually running before trying to stop
      // Html5Qrcode doesn't expose a direct way to check, so we wrap in try-catch
      await scanner.stop()
    } catch (error) {
      // Ignore "Cannot stop, scanner is not running or paused" errors
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (!errorMessage.includes('not running') && !errorMessage.includes('not paused')) {
        console.warn('Error stopping scanner:', error)
      }
    } finally {
      try {
        scanner.clear()
      } catch (error) {
        // Ignore errors during clear
      }
      setIsScanning(false)
    }
  }, [scanner])

  // Initialize scanner when enabled
  useEffect(() => {
    let currentScanner: Html5Qrcode | null = null
    let mounted = true
    let retryTimeout: ReturnType<typeof setTimeout> | null = null

    if (enabled) {
      const initScanner = async () => {
        // Wait for element to be available and laid out in DOM
        // Use a more robust check with retries
        const checkElement = (): HTMLElement | null => {
          // First try to get element from ref
          if (scannerRef.current) {
            const element = scannerRef.current.querySelector('#qr-reader') as HTMLElement | null
            if (element && element.clientWidth > 0 && element.clientHeight > 0) {
              return element
            }
          }
          // Fallback to getElementById
          const element = document.getElementById('qr-reader')
          if (element && element.clientWidth > 0 && element.clientHeight > 0) {
            return element
          }
          return null
        }

        // Retry logic with exponential backoff
        let retries = 0
        const maxRetries = 5
        const baseDelay = 200

        const tryInit = async (): Promise<void> => {
          if (!mounted) return

          const element = checkElement()
          
          if (!element) {
            if (retries < maxRetries) {
              retries++
              const delay = baseDelay * Math.pow(2, retries - 1)
              retryTimeout = setTimeout(() => {
                if (mounted) {
                  tryInit()
                }
              }, delay)
              return
            } else {
              if (mounted) {
                setScanError('Câmera não pode ser inicializada. Verifique se o elemento está visível.')
              }
              return
            }
          }

          // Element found and has dimensions
          try {
            const html5QrCode = new Html5Qrcode(element.id)
            currentScanner = html5QrCode

            if (mounted) {
              setScanner(html5QrCode)
              await startScanning(html5QrCode)
            }
          } catch (error) {
            console.error('Error initializing scanner:', error)
            if (mounted) {
              const message = error instanceof Error ? error.message : 'Erro ao inicializar scanner'
              setScanError(message)
            }
          }
        }

        // Start initialization
        tryInit()
      }

      // Small delay to ensure DOM is ready
      const initTimeout = setTimeout(() => {
        if (mounted) {
          initScanner()
        }
      }, 100)

      return () => {
        if (initTimeout) clearTimeout(initTimeout)
        if (retryTimeout) clearTimeout(retryTimeout)
      }
    }

    return () => {
      mounted = false
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
      if (currentScanner) {
        // Cleanup - safely handle both Promise and void returns from stop()
        Promise.resolve(currentScanner.stop())
          .catch((error) => {
            // Ignore "Cannot stop, scanner is not running or paused" errors
            const errorMessage = error instanceof Error ? error.message : String(error)
            if (!errorMessage.includes('not running') && !errorMessage.includes('not paused')) {
              console.warn('Error stopping scanner during cleanup:', error)
            }
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
  }, [enabled, startScanning, scannerRef])

  return {
    scanner,
    isScanning,
    scanError,
    scannerRef,
    stopScanning,
  }
}
