import React, { useState, useRef, useEffect } from 'react'
import {
  StyleSheet,
  View,
  ActivityIndicator,
  BackHandler,
  Text,
  TouchableOpacity,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { WebView } from 'react-native-webview'
import type { WebViewNavigation } from 'react-native-webview'

const WEBSITE_URL = 'https://www.mincteams.com.br'
const ALLOWED_DOMAINS = ['mincteams.com.br', 'www.mincteams.com.br']

export default function App() {
  const webViewRef = useRef<WebView>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)

  // Adiciona timestamp para evitar cache do index.html, garantindo app atualizado
  // O LocalStorage (login) é preservado pois o domínio é o mesmo
  const initialUrl = useRef(`${WEBSITE_URL}?ts=${Date.now()}`).current

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack()
        return true
      }
      return false
    })

    return () => backHandler.remove()
  }, [canGoBack])

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack)

    const url = navState.url
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain => url.includes(domain))

    if (!isAllowedDomain && !navState.loading) {
      webViewRef.current?.stopLoading()
      if (canGoBack) {
        webViewRef.current?.goBack()
      }
    }
  }

  const handleLoadStart = () => {
    setIsLoading(true)
    setHasError(false)
  }

  const isInitialLoadRef = useRef(true)
  const mountTimeRef = useRef(Date.now())

  // ... existing back handler code ...

  const handleLoadEnd = () => {
    if (isInitialLoadRef.current) {
      const elapsedTime = Date.now() - mountTimeRef.current
      const MIN_SPLASH_TIME = 2500 // 2.5 seconds

      if (elapsedTime < MIN_SPLASH_TIME) {
        setTimeout(() => {
          setIsLoading(false)
          isInitialLoadRef.current = false
        }, MIN_SPLASH_TIME - elapsedTime)
      } else {
        setIsLoading(false)
        isInitialLoadRef.current = false
      }
    } else {
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
    webViewRef.current?.reload()
  }

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="auto" />
        <Text style={styles.errorEmoji}>📡</Text>
        <Text style={styles.errorTitle}>Sem Conexão</Text>
        <Text style={styles.errorMessage}>
          Não foi possível carregar o conteúdo.{'\n'}
          Verifique sua conexão com a internet.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <WebView
        ref={webViewRef}
        source={{ uri: initialUrl }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={handleError}
        javaScriptEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        cacheEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        pullToRefreshEnabled={true}
        onShouldStartLoadWithRequest={request => {
          const isAllowed = ALLOWED_DOMAINS.some(domain => request.url.includes(domain))
          return isAllowed
        }}
        originWhitelist={['*']}
        mediaCapturePermissionGrantType="grant"
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.logoText}>MINC Teams</Text>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#18181b', // Dark background matching splash
    zIndex: 1,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#a1a1aa', // zinc-400
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f97316', // Brand orange
    marginBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
