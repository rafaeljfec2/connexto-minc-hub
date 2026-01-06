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
  const isInitializingRef = useRef(false)
  const onScanSuccessRef = useRef(onScanSuccess)
  const startScanningRef = useRef<((html5QrCode: Html5Qrcode) => Promise<void>) | null>(null)
  const shouldRestartAfterScanRef = useRef(false)

  // Keep onScanSuccess ref updated
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess
  }, [onScanSuccess])

  const startScanning = useCallback(async (html5QrCode: Html5Qrcode) => {
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
              await onScanSuccessRef.current(decodedText)
              // Don't restart automatically after successful scan
              shouldRestartAfterScanRef.current = false
            } catch (error) {
              console.error('Error processing QR code:', error)
              // Restart on error
              shouldRestartAfterScanRef.current = true
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
              await onScanSuccessRef.current(decodedText)
              // Don't restart automatically after successful scan
              shouldRestartAfterScanRef.current = false
            } catch {
              // Restart on error
              shouldRestartAfterScanRef.current = true
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
  }, [])

  // Keep startScanning ref updated after it's declared
  useEffect(() => {
    startScanningRef.current = startScanning
  }, [startScanning])

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
    let initTimeout: ReturnType<typeof setTimeout> | null = null

    // Cleanup function
    const cleanup = async (scannerInstance: Html5Qrcode | null) => {
      if (!scannerInstance) return

      try {
        await scannerInstance.stop()
      } catch (error) {
        // Ignore expected errors
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (
          !errorMessage.includes('not running') &&
          !errorMessage.includes('not paused') &&
          !errorMessage.includes('removed from the document')
        ) {
          // Only log unexpected errors
        }
      } finally {
        try {
          scannerInstance.clear()
        } catch {
          // Ignore errors during clear
        }
      }
    }

    // Cleanup existing scanner when disabled
    if (!enabled) {
      shouldRestartAfterScanRef.current = false
      if (scanner) {
        cleanup(scanner).then(() => {
          if (mounted) {
            setScanner(null)
            setIsScanning(false)
            setScanError(null)
          }
        })
      }
      return () => {
        mounted = false
        isInitializingRef.current = false
        if (initTimeout) clearTimeout(initTimeout)
        if (retryTimeout) clearTimeout(retryTimeout)
      }
    }

    // Reset restart flag when enabled changes to true
    if (enabled) {
      shouldRestartAfterScanRef.current = true
    }

    // Initialize scanner when enabled
    // Only initialize if enabled, not already initializing, and no scanner exists
    if (enabled && !isInitializingRef.current && !scanner) {
      isInitializingRef.current = true

      const initScanner = async () => {
        // Wait for element to be available and laid out in DOM
        const checkElement = (): HTMLElement | null => {
          // First try to get element from ref
          if (scannerRef.current) {
            const element = scannerRef.current.querySelector('#qr-reader') as HTMLElement | null
            if (
              element &&
              element.offsetParent !== null &&
              element.clientWidth > 0 &&
              element.clientHeight > 0
            ) {
              return element
            }
          }
          // Fallback to getElementById
          const element = document.getElementById('qr-reader')
          if (
            element &&
            element.offsetParent !== null &&
            element.clientWidth > 0 &&
            element.clientHeight > 0
          ) {
            return element
          }
          return null
        }

        // Retry logic with exponential backoff
        let retries = 0
        const maxRetries = 5
        const baseDelay = 200

        const tryInit = async (): Promise<void> => {
          if (!mounted || !enabled) {
            isInitializingRef.current = false
            return
          }

          const element = checkElement()

          if (!element) {
            if (retries < maxRetries) {
              retries++
              const delay = baseDelay * Math.pow(2, retries - 1)
              retryTimeout = setTimeout(() => {
                if (mounted && enabled) {
                  tryInit()
                } else {
                  isInitializingRef.current = false
                }
              }, delay)
              return
            } else {
              if (mounted) {
                setScanError(
                  'Câmera não pode ser inicializada. Verifique se o elemento está visível.'
                )
              }
              isInitializingRef.current = false
              return
            }
          }

          // Element found and has dimensions - double check it's still valid
          if (
            !element ||
            !element.offsetParent ||
            element.clientWidth === 0 ||
            element.clientHeight === 0
          ) {
            if (retries < maxRetries) {
              retries++
              const delay = baseDelay * Math.pow(2, retries - 1)
              retryTimeout = setTimeout(() => {
                if (mounted && enabled) {
                  tryInit()
                } else {
                  isInitializingRef.current = false
                }
              }, delay)
              return
            } else {
              if (mounted) {
                setScanError(
                  'Câmera não pode ser inicializada. Verifique se o elemento está visível.'
                )
              }
              isInitializingRef.current = false
              return
            }
          }

          // Element is valid, proceed with initialization
          try {
            // Ensure any existing scanner is cleaned up first
            if (currentScanner) {
              await cleanup(currentScanner)
              currentScanner = null
            }

            // Wait one more frame to ensure DOM is fully ready
            await new Promise(resolve => requestAnimationFrame(resolve))

            // Final check that element still exists
            const finalElement = document.getElementById('qr-reader')
            if (!finalElement || !finalElement.offsetParent || finalElement.clientWidth === 0) {
              throw new Error('Element became invalid during initialization')
            }

            const html5QrCode = new Html5Qrcode(finalElement.id)
            currentScanner = html5QrCode

            if (mounted && enabled && startScanningRef.current) {
              setScanner(html5QrCode)
              await startScanningRef.current(html5QrCode)
              isInitializingRef.current = false
            } else {
              // Component unmounted or disabled while initializing
              await cleanup(html5QrCode)
              currentScanner = null
              isInitializingRef.current = false
            }
          } catch (error) {
            console.error('Error initializing scanner:', error)
            if (mounted) {
              const message = error instanceof Error ? error.message : 'Erro ao inicializar scanner'
              setScanError(message)
            }
            if (currentScanner) {
              await cleanup(currentScanner)
              currentScanner = null
            }
            isInitializingRef.current = false
          }
        }

        // Start initialization with a small delay to ensure DOM is ready
        tryInit()
      }

      // Wait for next frame and then a small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        if (!mounted || !enabled || scanner) {
          isInitializingRef.current = false
          return
        }
        initTimeout = setTimeout(() => {
          if (mounted && enabled && !scanner) {
            initScanner()
          } else {
            isInitializingRef.current = false
          }
        }, 500)
      })
    }

    return () => {
      mounted = false
      isInitializingRef.current = false

      if (initTimeout) {
        clearTimeout(initTimeout)
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }

      if (currentScanner) {
        cleanup(currentScanner)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, scanner])

  return {
    scanner,
    isScanning,
    scanError,
    scannerRef,
    stopScanning,
  }
}
