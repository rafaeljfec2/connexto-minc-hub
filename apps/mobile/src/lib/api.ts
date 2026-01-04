import { ApiClient } from '@minc-hub/shared/services'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_CONFIG, STORAGE_KEYS } from '@/constants/config'

let tokenCache: string | null = null

function getCachedToken(): string | null {
  return tokenCache
}

function setTokenInCache(token: string): void {
  tokenCache = token
}

function clearTokenCache(): void {
  tokenCache = null
}

async function saveTokenToStorage(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  } catch (error) {
    console.error('Error saving token to storage:', error)
  }
}

async function removeTokenFromStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  } catch (error) {
    console.error('Error removing token from storage:', error)
  }
}

async function loadTokenFromStorage(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      setTokenInCache(token)
    }
  } catch (error) {
    console.error('Error loading token from storage:', error)
  }
}

const apiClient = new ApiClient({
  baseURL: API_CONFIG.BASE_URL,
  getToken: getCachedToken,
  setToken: (token: string) => {
    setTokenInCache(token)
    saveTokenToStorage(token).catch(() => {
      // Error already logged in saveTokenToStorage
    })
  },
  clearToken: () => {
    clearTokenCache()
    removeTokenFromStorage().catch(() => {
      // Error already logged in removeTokenFromStorage
    })
  },
  onUnauthorized: () => {
    // Navigation will be handled by navigator
  },
})

loadTokenFromStorage().catch(() => {
  // Error already logged in loadTokenFromStorage
})

export { apiClient }
export const api = apiClient.instance
