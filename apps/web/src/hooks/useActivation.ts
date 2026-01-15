import { useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import { unformatPhone } from '@/utils/phone-mask'

interface CheckActivationResponse {
  tempToken: string
  personName: string
}

interface CompleteActivationResponse {
  user: {
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
    personId: string | null
    avatar: string | null
    canCheckIn: boolean
    createdAt: string
    updatedAt: string
  }
  token: string
}

interface UseActivationReturn {
  isLoading: boolean
  error: Error | null
  checkActivation: (phone: string, accessCode: string) => Promise<CheckActivationResponse | null>
  completeActivation: (tempToken: string, email: string, password: string) => Promise<void>
}

function extractErrorMessage(err: unknown, defaultMessage: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosError = err as {
      response?: {
        status?: number
        data?: { message?: string; error?: string }
      }
    }

    // Extrair mensagem do backend
    const message = axiosError.response?.data?.message ?? axiosError.response?.data?.error
    if (message) {
      return message
    }

    // Mensagens específicas por status code
    if (axiosError.response?.status === 401) {
      return 'Token de ativação inválido ou expirado. Por favor, inicie o processo novamente.'
    }
    if (axiosError.response?.status === 404) {
      return 'Pessoa não encontrada. Verifique os dados e tente novamente.'
    }
    if (axiosError.response?.status === 409) {
      return 'Esta pessoa já possui uma conta ativada.'
    }

    return defaultMessage
  }
  if (err instanceof Error) {
    return err.message
  }
  return defaultMessage
}

export function useActivation(): UseActivationReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { showSuccess, showError } = useToast()
  const { login } = useAuth()

  const checkActivation = useCallback(
    async (phone: string, accessCode: string): Promise<CheckActivationResponse | null> => {
      try {
        setIsLoading(true)
        setError(null)

        const normalizedPhone = unformatPhone(phone)
        const normalizedCode = accessCode.toUpperCase().trim()

        const response = await api.post<{ data: CheckActivationResponse }>('/auth/activate/check', {
          phone: normalizedPhone,
          accessCode: normalizedCode,
        })

        // Debug: Log da resposta completa
        // eslint-disable-next-line no-console -- Debug temporário
        console.log('Resposta completa da API:', response)
        // eslint-disable-next-line no-console -- Debug temporário
        console.log('response.data:', response.data)

        // A resposta vem envolvida pelo TransformResponseInterceptor
        // Formato: { success: true, statusCode: 200, message: "...", data: { tempToken, personName } }
        const responseData = response.data as unknown as
          | { data?: CheckActivationResponse; tempToken?: string; personName?: string }
          | CheckActivationResponse

        // Verificar se está no formato wrapper
        if ('data' in responseData && responseData.data) {
          // eslint-disable-next-line no-console -- Debug temporário
          console.log('Retornando dados do wrapper:', responseData.data)
          return responseData.data
        }

        // Verificar se tem tempToken diretamente (formato direto)
        if ('tempToken' in responseData && responseData.tempToken) {
          // eslint-disable-next-line no-console -- Debug temporário
          console.log('Retornando dados diretos:', {
            tempToken: responseData.tempToken,
            personName: responseData.personName,
          })
          return {
            tempToken: responseData.tempToken,
            personName: responseData.personName ?? '',
          }
        }

        // Fallback: retornar como está
        // eslint-disable-next-line no-console -- Debug temporário
        console.log('Retornando fallback:', responseData)
        return responseData as CheckActivationResponse
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Erro ao validar código de acesso')
        const error = new Error(errorMessage)
        setError(error)
        showError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [showError]
  )

  const completeActivation = useCallback(
    async (tempToken: string, email: string, password: string): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await api.post<{ data: CompleteActivationResponse }>(
          '/auth/activate/complete',
          {
            tempToken,
            email: email.trim(),
            password,
          }
        )

        // A resposta vem envolvida pelo TransformResponseInterceptor
        // Formato: { success: true, statusCode: 200, message: "...", data: { user, token } }
        const responseData = response.data as unknown as { data?: CompleteActivationResponse }
        const activationData =
          responseData.data ?? (response.data as unknown as CompleteActivationResponse)

        // Salvar token e usuário
        if (activationData.token && typeof globalThis.window !== 'undefined') {
          localStorage.setItem('auth_token', activationData.token)
        }
        if (activationData.user && typeof globalThis.window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(activationData.user))
        }

        // Fazer login usando email e senha para atualizar o contexto
        // O token já foi salvo acima, então o login vai funcionar
        await login(activationData.user.email, password)

        showSuccess('Conta ativada com sucesso!')
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Erro ao completar ativação')
        const error = new Error(errorMessage)
        setError(error)
        showError(errorMessage)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [showError, showSuccess, login]
  )

  return {
    isLoading,
    error,
    checkActivation,
    completeActivation,
  }
}
