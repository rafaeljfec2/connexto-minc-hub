import { useState, useCallback, useEffect } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

export enum AccessCodeScopeType {
  CHURCH = 'church',
  MINISTRY = 'ministry',
  TEAM = 'team',
}

export interface AccessCode {
  id: string
  code: string
  scopeType: AccessCodeScopeType
  scopeId: string
  expiresAt: string
  isActive: boolean
  usageCount: number
  maxUsages: number | null
  createdAt: string
  updatedAt: string
  scopeName?: string
  isExpired: boolean
}

export interface CreateAccessCodeDto {
  code: string
  scopeType: AccessCodeScopeType
  scopeId: string
  expiresInDays?: number
  maxUsages?: number | null
}

interface UseAccessCodesReturn {
  codes: AccessCode[]
  isLoading: boolean
  error: Error | null
  fetchCodes: () => Promise<void>
  createCode: (dto: CreateAccessCodeDto) => Promise<AccessCode | null>
  deactivateCode: (codeId: string) => Promise<void>
  getStats: (codeId: string) => Promise<{ code: AccessCode; totalActivations: number } | null>
}

function extractErrorMessage(err: unknown, defaultMessage: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = err.response as { data?: { message?: string } }
    return response?.data?.message ?? defaultMessage
  }
  if (err instanceof Error) {
    return err.message
  }
  return defaultMessage
}

export function useAccessCodes(): UseAccessCodesReturn {
  const [codes, setCodes] = useState<AccessCode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { showSuccess, showError } = useToast()

  const fetchCodes = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.get<{ data?: AccessCode[] }>('/auth/access-codes')
      // API retorna dados encapsulados em { success, statusCode, data, ... }
      const codesData = response.data?.data ?? response.data
      setCodes(Array.isArray(codesData) ? codesData : [])
    } catch (err) {
      const errorMessage = extractErrorMessage(err, 'Erro ao buscar códigos de acesso')
      const error = new Error(errorMessage)
      setError(error)
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  const createCode = useCallback(
    async (dto: CreateAccessCodeDto): Promise<AccessCode | null> => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await api.post<{ data?: AccessCode }>('/auth/access-codes', {
          ...dto,
          code: dto.code.toUpperCase().trim(),
        })

        // API retorna dados encapsulados em { success, statusCode, data, ... }
        const codeData = response.data?.data ?? response.data

        // Atualizar lista de códigos
        await fetchCodes()

        showSuccess('Código de acesso criado com sucesso!')
        return codeData as AccessCode | null
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Erro ao criar código de acesso')
        const error = new Error(errorMessage)
        setError(error)
        showError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [showError, showSuccess, fetchCodes]
  )

  const deactivateCode = useCallback(
    async (codeId: string): Promise<void> => {
      try {
        setIsLoading(true)
        setError(null)

        await api.patch(`/auth/access-codes/${codeId}/deactivate`)

        // Atualizar lista de códigos
        await fetchCodes()

        showSuccess('Código desativado com sucesso!')
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Erro ao desativar código')
        const error = new Error(errorMessage)
        setError(error)
        showError(errorMessage)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [showError, showSuccess, fetchCodes]
  )

  const getStats = useCallback(
    async (codeId: string): Promise<{ code: AccessCode; totalActivations: number } | null> => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await api.get<{ data?: { code: AccessCode; totalActivations: number } }>(
          `/auth/access-codes/${codeId}/stats`
        )

        // API retorna dados encapsulados em { success, statusCode, data, ... }
        const statsData = response.data?.data ?? response.data
        return statsData as { code: AccessCode; totalActivations: number } | null
      } catch (err) {
        const errorMessage = extractErrorMessage(err, 'Erro ao buscar estatísticas')
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

  // Carregar códigos ao montar o componente
  useEffect(() => {
    fetchCodes()
  }, [fetchCodes])

  return {
    codes,
    isLoading,
    error,
    fetchCodes,
    createCode,
    deactivateCode,
    getStats,
  }
}
