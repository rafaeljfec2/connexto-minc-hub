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
  private readonly client: AxiosInstance
  private readonly config: ApiClientConfig

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
        // Só adiciona token no header se não estiver usando cookies
        // Quando usa cookies, o token é enviado automaticamente via withCredentials
        if (!this.config.useCookies) {
          const token = this.config.getToken()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      error => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Only clear token from storage if not using cookies
          // When using cookies, the token is managed by the server
          if (!this.config.useCookies) {
            this.config.clearToken()
          }
          // Evita chamar onUnauthorized se já estamos na tela de login
          // ou se a requisição é para /auth/me (verificação inicial)
          if (this.config.onUnauthorized && globalThis.window !== undefined) {
            const currentPath = globalThis.window.location.pathname
            const requestUrl = error.config?.url ?? ''
            const isAuthCheck = requestUrl.includes('/auth/me')

            // Não chama onUnauthorized durante verificação inicial
            // Deixa o AuthContext decidir se deve limpar o usuário
            if (!currentPath.includes('/login') && !isAuthCheck) {
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
