import { useState, useCallback } from 'react'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import type { Attendance } from '@minc-hub/shared/types'

interface GenerateQrCodeResponse {
  qrCode: string
  schedule: {
    id: string
    serviceId: string
    date: string
  }
  expiresAt: string
}

const apiServices = createApiServices(api)

export function useCheckIn() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrCodeData, setQrCodeData] = useState<GenerateQrCodeResponse | null>(null)
  const [history, setHistory] = useState<Attendance[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const generateQrCode = useCallback(
    async (date?: string) => {
      if (!user?.personId) {
        showToast('Você precisa estar vinculado a uma pessoa para gerar QR Code', 'error')
        return null
      }

      setIsLoading(true)
      try {
        const data = await apiServices.checkinService.generateQrCode(date)
        setQrCode(data.qrCode)
        setQrCodeData(data)
        showToast('QR Code gerado com sucesso!', 'success')
        return data
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao gerar QR Code'
        showToast(message, 'error')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [apiServices, user, showToast]
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
    [apiServices, showToast]
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
    [apiServices, showToast]
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
  }
}
