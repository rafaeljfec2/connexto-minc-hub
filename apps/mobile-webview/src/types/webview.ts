export interface AuthMessage {
  type: 'AUTH_SUCCESS' | 'AUTH_LOGOUT'
  token?: string
}

export interface WebViewLoadingState {
  isLoading: boolean
  hasError: boolean
  handleLoadStart: () => void
  handleLoadEnd: () => void
  handleError: () => void
  handleRetry: () => void
}
