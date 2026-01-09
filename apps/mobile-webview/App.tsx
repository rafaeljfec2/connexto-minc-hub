import React, { useState, useRef, useEffect } from 'react'
import {
  StyleSheet,
  View,
  ActivityIndicator,
  BackHandler,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { WebView } from 'react-native-webview'
import type { WebViewNavigation } from 'react-native-webview'
import * as SplashScreen from 'expo-splash-screen'

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

const WEBSITE_URL = 'https://www.mincteams.com.br'
const ALLOWED_DOMAINS = ['mincteams.com.br', 'www.mincteams.com.br']

export default function App() {
  const webViewRef = useRef<WebView>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)
  const [appIsReady, setAppIsReady] = useState(false)

  // Prepare app and hide splash screen
  useEffect(() => {
    async function prepare() {
      try {
        // Add any initialization logic here (e.g., load fonts, check auth)
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (e) {
        console.warn(e)
      } finally {
        setAppIsReady(true)
        await SplashScreen.hideAsync()
      }
    }

    prepare()
  }, [])

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack()
        return true // Prevent default behavior
      }
      return false // Allow default behavior (exit app)
    })

    return () => backHandler.remove()
  }, [canGoBack])

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack)

    // Block external domains
    const url = navState.url
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain => url.includes(domain))

    if (!isAllowedDomain && !navState.loading) {
      // Stop loading and go back
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

  const handleLoadEnd = () => {
    setIsLoading(false)
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

  if (!appIsReady) {
    return null
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

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: WEBSITE_URL }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
        // Security settings
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Performance
        cacheEnabled={true}
        // Handle external links
        onShouldStartLoadWithRequest={request => {
          const isAllowed = ALLOWED_DOMAINS.some(domain => request.url.includes(domain))
          return isAllowed
        }}
      />
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
    backgroundColor: '#fff',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
