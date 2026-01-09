import { X, Check } from 'lucide-react'

interface FileInfo {
  name: string
  size: number
  type: string
}

interface IncomingTransferModalProps {
  isOpen: boolean
  fromUserName: string
  fileInfo: FileInfo
  onAccept: () => void
  onReject: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎬'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊'
  return '📎'
}

export function IncomingTransferModal({
  isOpen,
  fromUserName,
  fileInfo,
  onAccept,
  onReject,
}: IncomingTransferModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-primary-500 px-6 py-4 text-white">
          <h3 className="text-lg font-semibold">Transferência de Arquivo</h3>
          <p className="text-sm text-white/80">{fromUserName} quer enviar um arquivo</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-900 rounded-xl">
            <div className="flex-shrink-0 text-3xl">
              {getFileIcon(fileInfo.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                {fileInfo.name}
              </p>
              <p className="text-xs text-dark-500 dark:text-dark-400">
                {formatFileSize(fileInfo.size)} • {fileInfo.type || 'Arquivo'}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-dark-600 dark:text-dark-400 text-center">
            O arquivo será transferido diretamente (P2P) sem passar pelo servidor.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-dark-300 dark:border-dark-600 text-dark-700 dark:text-dark-300 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Recusar</span>
          </button>
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
          >
            <Check className="h-4 w-4" />
            <span>Aceitar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
