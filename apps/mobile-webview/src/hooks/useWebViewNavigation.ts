import { useState, useEffect, RefObject } from 'react'
import { BackHandler } from 'react-native'
import { WebView } from 'react-native-webview'
import type { WebViewNavigation } from 'react-native-webview'
import { ALLOWED_DOMAINS } from '../constants/webview'

export function useWebViewNavigation(webViewRef: RefObject<WebView>) {
  const [canGoBack, setCanGoBack] = useState(false)

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
