import axios, { AxiosInstance, AxiosError } from 'axios'

export interface ApiClientConfig {
  baseURL: string
  getToken: () => string | null
  setToken: (token: string) => void
  clearToken: () => void
  onUnauthorized?: () => void
  useCookies?: boolean
  requestTokenInBody?: boolean
}

export class ApiClient {
  private client: AxiosInstance
  private config: ApiClientConfig

  constructor(config: ApiClientConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(config.requestTokenInBody && { 'X-Request-Token-Body': 'true' }),
      },
      withCredentials: config.useCookies ?? false,
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      config => {
        const token = this.config.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      error => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.config.clearToken()
          // Evita chamar onUnauthorized se já estamos na tela de login
          if (this.config.onUnauthorized && globalThis.window !== undefined) {
            const currentPath = globalThis.window.location.pathname
            if (!currentPath.includes('/login')) {
              this.config.onUnauthorized()
            }
          }
        }
        return Promise.reject(error)
      }
    )
  }

  setToken(token: string): void {
    this.config.setToken(token)
  }

  get instance(): AxiosInstance {
    return this.client
  }
}
