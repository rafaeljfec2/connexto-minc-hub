import { useState, useEffect, useRef, RefObject } from 'react'
import { BackHandler, Platform } from 'react-native'
import { WebView } from 'react-native-webview'
import type { WebViewNavigation } from 'react-native-webview'
import { ALLOWED_DOMAINS } from '../constants/webview'

// Script para forçar reload sem cache no iOS Safari
const FORCE_RELOAD_SCRIPT = `
  (function() {
    // Adiciona timestamp para bypass de cache
    const url = new URL(window.location.href);
    if (!url.searchParams.has('_t')) {
      url.searchParams.set('_t', Date.now().toString());
      window.location.replace(url.toString());
    }
  })();
  true;
`

export function useWebViewNavigation(webViewRef: RefObject<WebView>) {
  const [canGoBack, setCanGoBack] = useState(false)
  const lastActivateReloadRef = useRef<string | null>(null)

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack()
        return true
      }
      return false
    })

    return () => backHandler.remove()
  }, [canGoBack, webViewRef])

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack)

    const url = navState.url
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain => url.includes(domain))

    // iOS: Força reload sem cache na página /activate para evitar problemas de cache
    if (Platform.OS === 'ios' && url.includes('/activate') && !navState.loading) {
      // Evita loops infinitos - só força reload uma vez por URL base
      const urlWithoutParams = url.split('?')[0]
      if (lastActivateReloadRef.current !== urlWithoutParams) {
        lastActivateReloadRef.current = urlWithoutParams
        webViewRef.current?.injectJavaScript(FORCE_RELOAD_SCRIPT)
      }
    }

    if (!isAllowedDomain && !navState.loading) {
      webViewRef.current?.stopLoading()
      if (navState.canGoBack) {
        webViewRef.current?.goBack()
      }
    }
  }

  const shouldStartLoadWithRequest = (request: { url: string }) => {
    const isAllowed = ALLOWED_DOMAINS.some(domain => request.url.includes(domain))
    return isAllowed
  }

  return {
    canGoBack,
    handleNavigationStateChange,
    shouldStartLoadWithRequest,
  }
}
