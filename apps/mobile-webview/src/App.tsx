import React, { useRef } from 'react'
import { StyleSheet, Platform } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { WebView } from 'react-native-webview'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { WEBSITE_URL, USER_AGENT } from './constants/webview'
import { useAuthToken } from './hooks/useAuthToken'
import { useWebViewNavigation } from './hooks/useWebViewNavigation'
import { useWebViewLoading } from './hooks/useWebViewLoading'
import { LoadingScreen } from './components/LoadingScreen'
import { ErrorScreen } from './components/ErrorScreen'

// iOS já gerencia Safe Area automaticamente
// Android precisa de edges explícitos
const SAFE_AREA_EDGES = Platform.select({
  ios: [] as const,
  android: ['top', 'bottom'] as const,
  default: [] as const,
})

function AppContent() {
  const webViewRef = useRef<WebView>(null)

  const { initialScript, handleMessage } = useAuthToken()
  const { handleNavigationStateChange, shouldStartLoadWithRequest } =
    useWebViewNavigation(webViewRef)
  const { isLoading, hasError, handleLoadStart, handleLoadEnd, handleError, handleRetry } =
    useWebViewLoading(webViewRef)

  if (hasError) {
    return <ErrorScreen onRetry={handleRetry} />
  }

  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
      <StatusBar style="auto" />

      <WebView
        ref={webViewRef}
        source={{ uri: WEBSITE_URL }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={handleError}
        onMessage={handleMessage}
        injectedJavaScriptBeforeContentLoaded={initialScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        cacheEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        pullToRefreshEnabled={true}
        onShouldStartLoadWithRequest={shouldStartLoadWithRequest}
        originWhitelist={['*']}
        mediaCapturePermissionGrantType="grant"
        userAgent={USER_AGENT}
        startInLoadingState={false}
        androidLayerType="hardware"
        mixedContentMode="always"
      />

      {isLoading && <LoadingScreen />}
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
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
})
