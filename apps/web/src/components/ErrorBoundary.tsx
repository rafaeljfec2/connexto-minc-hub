import React, { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  readonly children: ReactNode
  readonly fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    // Sempre restaurar o overflow do body em caso de erro
    document.body.style.overflow = 'unset'
  }

  componentDidMount() {
    // Adicionar listener global para garantir que o overflow seja sempre restaurado
    const handleBeforeUnload = () => {
      document.body.style.overflow = 'unset'
    }
    globalThis.addEventListener('beforeunload', handleBeforeUnload)
    this.handleBeforeUnload = handleBeforeUnload
  }

  private handleBeforeUnload?: () => void

  componentWillUnmount() {
    if (this.handleBeforeUnload) {
      globalThis.removeEventListener('beforeunload', this.handleBeforeUnload)
    }
    // Garantir que o overflow seja restaurado ao desmontar
    document.body.style.overflow = 'unset'
  }

  handleReset = () => {
    // Garantir que o overflow seja restaurado antes de resetar
    document.body.style.overflow = 'unset'
    this.setState({ hasError: false, error: null })
    globalThis.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-dark-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-900">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              Algo deu errado
            </h2>
            <p className="text-dark-700 dark:text-dark-300 mb-4">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-dark-600 dark:text-dark-400">
                  Detalhes do erro
                </summary>
                <pre className="mt-2 text-xs bg-dark-50 dark:bg-dark-900 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
