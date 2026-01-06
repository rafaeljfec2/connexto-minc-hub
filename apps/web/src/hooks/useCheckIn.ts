import { useState, useCallback } from 'react'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import type { Attendance, GenerateQrCodeResponse } from '@minc-hub/shared/types'

const apiServices = createApiServices(api)

export function useCheckIn() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrCodeData, setQrCodeData] = useState<GenerateQrCodeResponse | null>(null)
  const [history, setHistory] = useState<Attendance[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [hasNoSchedule, setHasNoSchedule] = useState(false)

  const generateQrCode = useCallback(
    async (date?: string) => {
      if (!user?.personId) {
        // Don't show toast here - let the component handle it
        // The component should check user state before calling this
        return null
      }

      setIsLoading(true)
      setHasNoSchedule(false)
      try {
        const data = await apiServices.checkinService.generateQrCode(date)
        setQrCode(data.qrCode)
        setQrCodeData(data)
        setHasNoSchedule(false)
        showToast('QR Code gerado com sucesso!', 'success')
        return data
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao gerar QR Code'
        // Check if it's a "no schedule" error
        if (
          message.includes('No schedules found') ||
          message.includes('Não há agenda') ||
          message.includes('No schedule')
        ) {
          setHasNoSchedule(true)
          setQrCode(null)
          setQrCodeData(null)
          // Don't show error toast for "no schedule" - it's expected
        } else if (
          message.includes('must be linked to a person') ||
          message.includes('vinculado')
        ) {
          // This error should be handled by the component, not shown as toast here
          setQrCode(null)
          setQrCodeData(null)
        } else {
          showToast(message, 'error')
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
  }
}
