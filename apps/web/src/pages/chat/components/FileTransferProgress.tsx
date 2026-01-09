import { X, Download, Check, AlertCircle, Loader2, Upload, ArrowDown } from 'lucide-react'
import { TransferProgress } from '@minc-hub/shared/services/webrtc/webrtc-file-transfer.service'

interface FileTransferProgressProps {
  transfers: TransferProgress[]
  onCancel: (transferId: string) => void
  onDownload?: (transferId: string) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function TransferItem({
  transfer,
  onCancel,
  onDownload,
}: {
  transfer: TransferProgress
  onCancel: () => void
  onDownload?: () => void
}) {
  const isUpload = transfer.direction === 'upload'
  const isComplete = transfer.status === 'completed'
  const isFailed = transfer.status === 'failed' || transfer.status === 'rejected'
  const isTransferring = transfer.status === 'transferring'
  const isConnecting = transfer.status === 'connecting'

  const getStatusIcon = () => {
    if (isComplete) {
      return <Check className="h-4 w-4 text-green-500" />
    }
    if (isFailed) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    if (isConnecting) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    }
    if (isTransferring) {
      return isUpload ? (
        <Upload className="h-4 w-4 text-primary-500" />
      ) : (
        <ArrowDown className="h-4 w-4 text-primary-500" />
      )
    }
    return <Loader2 className="h-4 w-4 text-dark-400 animate-spin" />
  }

  const getStatusText = () => {
    switch (transfer.status) {
      case 'pending':
        return 'Aguardando...'
      case 'connecting':
        return 'Conectando...'
      case 'transferring':
        return isUpload ? 'Enviando...' : 'Recebendo...'
      case 'completed':
        return isUpload ? 'Enviado' : 'Recebido'
      case 'failed':
        return 'Falhou'
      case 'rejected':
        return 'Rejeitado'
      default:
        return 'Desconhecido'
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-200 dark:border-dark-700">
      {/* Icon */}
      <div className="flex-shrink-0">{getStatusIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
            {transfer.fileName}
          </span>
          <span className="text-xs text-dark-500 dark:text-dark-400 flex-shrink-0">
            {formatFileSize(transfer.fileSize)}
          </span>
        </div>

        {/* Progress bar */}
        {(isTransferring || isConnecting) && (
          <div className="h-1.5 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${transfer.progress}%` }}
            />
          </div>
        )}

        {/* Status text */}
        <div className="flex items-center justify-between mt-1">
          <span
            className={`text-xs ${
              isFailed
                ? 'text-red-500'
                : isComplete
                  ? 'text-green-500'
                  : 'text-dark-500 dark:text-dark-400'
            }`}
          >
            {getStatusText()}
          </span>
          {isTransferring && (
            <span className="text-xs text-dark-500 dark:text-dark-400">
              {transfer.progress}%
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {isComplete && !isUpload && onDownload && (
          <button
            onClick={onDownload}
            className="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="Baixar arquivo"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
        {!isComplete && !isFailed && (
          <button
            onClick={onCancel}
            className="p-1.5 text-dark-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Cancelar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function FileTransferProgress({ transfers, onCancel, onDownload }: FileTransferProgressProps) {
  if (transfers.length === 0) return null

  return (
    <div className="space-y-2 p-3 bg-gray-50 dark:bg-dark-900 border-t border-dark-200 dark:border-dark-800">
      <div className="flex items-center gap-2 text-xs font-medium text-dark-600 dark:text-dark-400 uppercase tracking-wide">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Transferências P2P</span>
      </div>
      {transfers.map(transfer => (
        <TransferItem
          key={transfer.transferId}
          transfer={transfer}
          onCancel={() => onCancel(transfer.transferId)}
          onDownload={onDownload ? () => onDownload(transfer.transferId) : undefined}
        />
      ))}
    </div>
  )
}
