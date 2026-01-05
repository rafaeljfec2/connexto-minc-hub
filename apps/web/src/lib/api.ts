import { ApiClient } from '@minc-hub/shared/services'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const apiClient = new ApiClient({
  baseURL: `${API_BASE_URL}/minc-teams/v1`,
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
    // Verifica se há usuário no storage antes de limpar
    // Isso evita limpar durante verificação inicial
    const storedUser = localStorage.getItem('auth_user')
    if (!storedUser && globalThis.window !== undefined) {
      // Só redireciona se não houver usuário no storage
      globalThis.window.location.href = '/login'
    }
  },
  useCookies: true,
  requestTokenInBody: false,
})

export { apiClient }
export const api = apiClient.instance
