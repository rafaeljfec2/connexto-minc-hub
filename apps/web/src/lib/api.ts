import { ApiClient } from '@minc-hub/shared/services'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const apiClient = new ApiClient({
  baseURL: `${API_BASE_URL}/minc-teams/v1`,
  getToken: () => {
    if (typeof globalThis.window === 'undefined') return null
    return localStorage.getItem('auth_token')
  },
  setToken: (token: string) => {
    if (typeof globalThis.window === 'undefined') return
    localStorage.setItem('auth_token', token)
  },
  clearToken: () => {
    if (typeof globalThis.window === 'undefined') return
    localStorage.removeItem('auth_token')
  },
  onUnauthorized: () => {
    // Se chegou aqui, o refresh token falhou ou a sessão expirou invalida
    // Devemos forçar o logout para o usuário não ficar preso
    if (typeof globalThis.window !== 'undefined') {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
      globalThis.window.location.href = '/login'
    }
  },
  useCookies: true,
  requestTokenInBody: false,
})

export { apiClient }
export const api = apiClient.instance
