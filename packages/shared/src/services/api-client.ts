import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

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

  private setupInterceptors(): void {
    this.setupRequestInterceptor()
    this.setupResponseInterceptor()
  }

  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      config => this.handleRequest(config),
      error => Promise.reject(error)
    )
  }

  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => this.handleResponseError(error)
    )
  }

  private handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // Only add token to header if not using cookies
    if (!this.config.useCookies) {
      const token = this.config.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  }

  private async handleResponseError(error: AxiosError): Promise<any> {
    const originalRequest = error.config as any
    const enrichedError = this.enrichError(error)

    if (error.response?.status === 401 && originalRequest) {
      return this.handle401(error, originalRequest, enrichedError)
    }

    return Promise.reject(enrichedError)
  }

  private enrichError(error: AxiosError): AxiosError {
    if (error.response?.data) {
      const data = error.response.data as any
      if (data.message) {
        // Modify the existing error message instead of creating a new Error
        error.message = data.message
      }
    }
    return error
  }

  private async handle401(
    error: AxiosError,
    originalRequest: any,
    apiError: AxiosError
  ): Promise<any> {
    // Fail immediately if error is from auth endpoints
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh-token')
    ) {
      this.handleAuthFailure(error)
      return Promise.reject(apiError)
    }

    // Fail if already retried
    if (originalRequest._retry) {
      this.handleAuthFailure(error)
      return Promise.reject(apiError)
    }

    if (this.isRefreshing) {
      return this.addToQueue(originalRequest)
    }

    originalRequest._retry = true
    this.isRefreshing = true

    try {
      return await this.performRefreshToken(originalRequest)
    } catch (refreshError) {
      this.processQueue(refreshError as Error)
      this.handleAuthFailure(error)
      return Promise.reject(refreshError)
    } finally {
      this.isRefreshing = false
    }
  }

  private addToQueue(originalRequest: any): Promise<any> {
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

  private async performRefreshToken(originalRequest: any): Promise<AxiosResponse> {
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

  private handleAuthFailure(error: AxiosError): void {
    if (!this.config.useCookies) {
      this.config.clearToken()
    }

    if (this.config.onUnauthorized && globalThis.window !== undefined) {
      const currentPath = globalThis.window.location.pathname
      const requestUrl = error.config?.url ?? ''
      const isAuthCheck = requestUrl.includes('/auth/me')

      if (!currentPath.includes('/login') && !isAuthCheck) {
        this.config.onUnauthorized()
      }
    }
  }

  setToken(token: string): void {
    this.config.setToken(token)
  }

  get instance(): AxiosInstance {
    return this.client
  }
}
