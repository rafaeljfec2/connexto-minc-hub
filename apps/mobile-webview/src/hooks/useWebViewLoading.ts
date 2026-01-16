import { useState, useRef, RefObject, useEffect } from 'react'
import { WebView } from 'react-native-webview'
import { MIN_SPLASH_TIME } from '../constants/webview'

const MAX_LOADING_TIME = 15000 // 15 segundos timeout máximo

export function useWebViewLoading(webViewRef: RefObject<WebView>) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const isInitialLoadRef = useRef(true)
  const mountTimeRef = useRef(Date.now())
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Timeout de segurança: se após 15s ainda estiver carregando, força o fim do loading
  useEffect(() => {
    if (isLoading && isInitialLoadRef.current) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('[WebView] Timeout de 15s - forçando fim do loading')
        isInitialLoadRef.current = false
        setIsLoading(false)
      }, MAX_LOADING_TIME)
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }, [isLoading])

  const handleLoadStart = () => {
    // Apenas o load inicial mostra splash
    // Navegações subsequentes não mostram loading (WebView já está visível)
    setHasError(false)
  }

  const handleLoadEnd = () => {
    // Limpar timeout de segurança
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }

    if (isInitialLoadRef.current) {
      // Marca como não-inicial IMEDIATAMENTE para evitar múltiplos timeouts
      isInitialLoadRef.current = false

      const elapsedTime = Date.now() - mountTimeRef.current

      if (elapsedTime < MIN_SPLASH_TIME) {
        const delay = MIN_SPLASH_TIME - elapsedTime
        setTimeout(() => {
          setIsLoading(false)
        }, delay)
      } else {
        setIsLoading(false)
      }
    } else {
      // Navegação subsequente - não faz nada, WebView já está visível
      setIsLoading(false)
    }
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleRetry = () => {
    setHasError(false)
    setIsLoading(true)
    isInitialLoadRef.current = true
    mountTimeRef.current = Date.now()
    webViewRef.current?.reload()
  }

  return {
    isLoading,
    hasError,
    handleLoadStart,
    handleLoadEnd,
    handleError,
    handleRetry,
  }
}
