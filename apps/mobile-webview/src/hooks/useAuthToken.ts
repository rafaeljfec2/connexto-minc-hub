import { useState, useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'
import type { WebViewMessageEvent } from 'react-native-webview'
import { AUTH_TOKEN_KEY } from '../constants/webview'
import type { AuthMessage } from '../types/webview'

export function useAuthToken() {
  const [initialScript, setInitialScript] = useState<string>('')

  useEffect(() => {
    loadToken()
  }, [])

  const loadToken = async () => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY)
      if (token) {
        const script = `
          try {
            window.localStorage.setItem('${AUTH_TOKEN_KEY}', '${token}');
          } catch (e) {
            console.error('Failed to inject token', e);
          }
          true;
        `
        setInitialScript(script)
      }
    } catch (error) {
      console.error('Error loading token:', error)
    }
  }

  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      if (!event.nativeEvent.data) return

      const data: AuthMessage = JSON.parse(event.nativeEvent.data)

      if (data.type === 'AUTH_SUCCESS' && data.token) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.token)
      } else if (data.type === 'AUTH_LOGOUT') {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY)
      }
    } catch {
      // Ignore parse errors from other messages
    }
  }

  return {
    initialScript,
    handleMessage,
  }
}
