import { ApiClient } from '@minc-hub/shared/services'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  getToken: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  },
  setToken: (token: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('auth_token', token)
  },
  clearToken: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth_token')
  },
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },
  useCookies: true,
  requestTokenInBody: false,
})

export { apiClient }
export const api = apiClient.instance
