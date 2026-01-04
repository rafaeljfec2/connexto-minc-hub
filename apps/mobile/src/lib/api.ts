import { ApiClient } from '@minc-hub/shared/services'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'

let tokenCache: string | null = null

const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  getToken: () => {
    // Return cached token, will be refreshed on each request
    return tokenCache
  },
  setToken: (token: string) => {
    tokenCache = token
    AsyncStorage.setItem('auth_token', token).catch(() => {
      // Handle error
    })
  },
  clearToken: () => {
    tokenCache = null
    AsyncStorage.removeItem('auth_token').catch(() => {
      // Handle error
    })
  },
  onUnauthorized: () => {
    // Handle unauthorized - navigation will be handled in navigator
  },
})

// Load token from storage on app start
AsyncStorage.getItem('auth_token')
  .then(token => {
    if (token) {
      tokenCache = token
    }
  })
  .catch(() => {
    // Handle error
  })

export { apiClient }
export const api = apiClient.instance
