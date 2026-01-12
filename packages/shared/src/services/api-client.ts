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
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: unknown) => void
  }> = []

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

  private processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })

    this.failedQueue = []
  }

  private handle401Error(error: AxiosError): void {
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
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        // Extract error message from API response body
        let apiError = error
        if (error.response?.data) {
          const data = error.response.data as any
          if (data.message) {
            // Create a new error with the API message
            apiError = new Error(data.message) as AxiosError
            // Preserve original error properties for debugging
            Object.assign(apiError, {
              config: error.config,
              code: error.code,
              request: error.request,
              response: error.response,
              status: error.response.status,
              statusText: error.response.statusText,
              isAxiosError: true,
              toJSON: error.toJSON,
            })
          }
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && originalRequest) {
          // If the error comes from login or refresh-token endpoint, simply fail
          if (
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/refresh-token')
          ) {
            this.handle401Error(error)
            return Promise.reject(apiError)
          }

          // If retry flag is set, it means we already tried to refresh and failed
          if (originalRequest._retry) {
            this.handle401Error(error)
            return Promise.reject(apiError)
          }

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            })
              .then(() => {
                return this.client(originalRequest)
              })
              .catch(err => {
                return Promise.reject(err)
              })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const refreshResponse = await this.client.post(
              '/auth/refresh-token',
              {},
              {
                headers: { 'X-Request-Token-Body': 'true' },
              }
            )

            const newToken = refreshResponse.data?.token
            if (newToken) {
              this.setToken(newToken)
            }

            this.processQueue(null, newToken)
            return this.client(originalRequest)
          } catch (refreshError) {
            this.processQueue(refreshError as Error)
            this.handle401Error(error)
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(apiError)
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
