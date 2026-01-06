import { QRCodeSVG } from 'qrcode.react'
import { Card } from '@/components/ui/Card'
import { ErrorMessage, CheckInErrorType } from './ErrorMessage'
import type { GenerateQrCodeResponse } from '@minc-hub/shared/types'

interface QrCodeDisplayProps {
  isLoading: boolean
  isLoadingUser: boolean
  hasPersonId: boolean
  qrCode: string | null
  qrCodeData: GenerateQrCodeResponse | null
  errorType: CheckInErrorType
  errorMessage?: string | null
  userName?: string | null
}

export function QrCodeDisplay({
  isLoading,
  isLoadingUser,
  hasPersonId,
  qrCode,
  qrCodeData,
  errorType,
  errorMessage,
  userName,
}: QrCodeDisplayProps) {
  const renderContent = () => {
    if (isLoadingUser || isLoading) {
      return (
        <div className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
        </div>
      )
    }

    if (!hasPersonId) {
      return (
        <div className="bg-dark-100 dark:bg-dark-800 p-6 rounded-2xl mb-8">
          <div className="text-center">
            <p className="text-base font-medium text-dark-900 dark:text-dark-50 mb-2">
              Usuário não vinculado
            </p>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Você precisa estar vinculado a uma pessoa para gerar QR Code
            </p>
          </div>
        </div>
      )
    }

    if (qrCode) {
      return (
        <>
          <div className="bg-white p-6 rounded-2xl border border-dark-200 dark:border-dark-800 mb-8 flex justify-center">
            <QRCodeSVG value={qrCode} size={200} />
          </div>
          {qrCodeData?.expiresAt && (
            <p className="text-xs text-dark-500 dark:text-dark-400 mb-4">
              Expira em:{' '}
              {new Date(qrCodeData.expiresAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </>
      )
    }

    return <ErrorMessage errorType={errorType} errorMessage={errorMessage} />
  }

  return (
    <Card className="w-full max-w-sm p-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-1">
          Meu Código de Check-in
        </h2>
        <p className="text-sm text-dark-600 dark:text-dark-400 mb-8">
          Apresente este código para leitura
        </p>

        {renderContent()}

        <div className="text-center">
          <p className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-1">
            {userName || 'Usuário'}
          </p>
          <p className="text-sm font-medium text-primary-500 dark:text-primary-400">Membro</p>
        </div>
      </div>
    </Card>
  )
}
