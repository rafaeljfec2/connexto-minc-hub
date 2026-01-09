import { useState, useCallback } from 'react'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import type { Attendance, GenerateQrCodeResponse } from '@minc-hub/shared/types'

const apiServices = createApiServices(api)

// Helper to categorize errors
function categorizeError(message: string): {
  type: 'closed' | 'no-schedule' | 'not-linked' | 'already-checked' | 'other'
  msg: string
  shouldShowToast: boolean
} {
  if (message.includes('No schedules found') || message.includes('Não há agenda')) {
    return { type: 'no-schedule', msg: message, shouldShowToast: false }
  }

  if (message.includes('must be linked to a person') || message.includes('vinculado')) {
    return { type: 'not-linked', msg: message, shouldShowToast: false }
  }

  if (
    message.includes('Check-in is closed') ||
    message.includes('has passed') ||
    message.includes('not yet open') ||
    message.includes('Service time') ||
    message.includes('Check-in opens')
  ) {
    return { type: 'closed', msg: message, shouldShowToast: false }
  }

  if (message.includes('Already checked in')) {
    return { type: 'already-checked', msg: message, shouldShowToast: true }
  }

  return { type: 'other', msg: message, shouldShowToast: false }
}

export function useCheckIn() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrCodeData, setQrCodeData] = useState<GenerateQrCodeResponse | null>(null)
  const [history, setHistory] = useState<Attendance[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [hasNoSchedule, setHasNoSchedule] = useState(false)
  const [errorType, setErrorType] = useState<
    'closed' | 'no-schedule' | 'not-linked' | 'already-checked' | 'other' | null
  >(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const generateQrCode = useCallback(
    async (date?: string) => {
      if (!user?.personId) {
        return null
      }

      setIsLoading(true)
      setHasNoSchedule(false)
      setErrorType(null)
      setErrorMessage(null)

      try {
        const data = await apiServices.checkinService.generateQrCode(date)
        setQrCode(data.qrCode)
        setQrCodeData(data)
        return data
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao gerar QR Code'
        const { type, msg, shouldShowToast } = categorizeError(message)

        setErrorType(type)
        setErrorMessage(msg)
        setQrCode(null)
        setQrCodeData(null)

        if (type === 'no-schedule') {
          setHasNoSchedule(true)
        }

        if (shouldShowToast) {
          showToast(
            type === 'already-checked' ? 'Você já fez check-in para esta escala' : msg,
            'info'
          )
        }

        return null
      } finally {
        setIsLoading(false)
      }
    },
    [user, showToast]
  )

  const validateQrCode = useCallback(
    async (qrCodeDataString: string) => {
      setIsLoading(true)
      try {
        const attendance = await apiServices.checkinService.validateQrCode(qrCodeDataString)
        showToast('Check-in realizado com sucesso!', 'success')
        return attendance
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao validar QR Code'
        showToast(message, 'error')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [showToast]
  )

  const fetchHistory = useCallback(
    async (limit = 50) => {
      setIsLoadingHistory(true)
      try {
        const data = await apiServices.checkinService.getHistory(limit)
        setHistory(data)
        return data
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao buscar histórico'
        showToast(message, 'error')
        return []
      } finally {
        setIsLoadingHistory(false)
      }
    },
    [showToast]
  )

  return {
    generateQrCode,
    validateQrCode,
    fetchHistory,
    qrCode,
    qrCodeData,
    history,
    isLoading,
    isLoadingHistory,
    hasNoSchedule,
    errorType,
    errorMessage,
  }
}
