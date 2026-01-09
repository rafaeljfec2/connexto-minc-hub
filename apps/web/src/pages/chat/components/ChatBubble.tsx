import { useState, useCallback } from 'react'
import { Download, FileText, Image, Film, Music, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

type MessageStatus = 'sending' | 'sent' | 'read'
type FileDownloadStatus = 'pending' | 'downloading' | 'completed' | 'failed'

export interface FileAttachment {
  name: string
  size: number
  type: string
  senderId: string
}

interface ChatBubbleProps {
  readonly message: string
  readonly isMe: boolean
  readonly timestamp: string
  readonly status?: MessageStatus
  readonly fileAttachment?: FileAttachment
  readonly onDownloadFile?: (senderId: string, fileInfo: FileAttachment) => Promise<void>
  readonly downloadProgress?: number
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image className="h-8 w-8" />
  if (mimeType.startsWith('video/')) return <Film className="h-8 w-8" />
  if (mimeType.startsWith('audio/')) return <Music className="h-8 w-8" />
  return <FileText className="h-8 w-8" />
}

export function ChatBubble({
  message,
  isMe,
  timestamp,
  status,
  fileAttachment,
  onDownloadFile,
  downloadProgress,
}: ChatBubbleProps) {
  const [downloadStatus, setDownloadStatus] = useState<FileDownloadStatus>('pending')

  // Robust UTC parsing
  let dateStr = timestamp
  if (typeof timestamp === 'string') {
    if (!timestamp.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(timestamp)) {
      dateStr = `${timestamp}Z`
    }
  }

  const date = new Date(dateStr)
  const isValidDate = !Number.isNaN(date.getTime())

  const time = isValidDate
    ? new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
      }).format(date)
    : '--:--'

  const handleFileClick = useCallback(async () => {
    if (!fileAttachment || !onDownloadFile || isMe) return
    if (downloadStatus === 'downloading' || downloadStatus === 'completed') return

    setDownloadStatus('downloading')
    try {
      await onDownloadFile(fileAttachment.senderId, fileAttachment)
      setDownloadStatus('completed')
    } catch {
      setDownloadStatus('failed')
    }
  }, [fileAttachment, onDownloadFile, isMe, downloadStatus])

  // Render file attachment bubble
  if (fileAttachment) {
    const isClickable = !isMe && downloadStatus === 'pending'
    const showProgress = downloadStatus === 'downloading' && downloadProgress !== undefined

    return (
      <div
        onClick={isClickable ? handleFileClick : undefined}
        className={`mb-3 max-w-[80%] rounded-2xl overflow-hidden ${
          isMe
            ? 'ml-auto bg-primary-500 text-white rounded-br-sm'
            : 'mr-auto bg-dark-200 dark:bg-dark-800 text-dark-900 dark:text-dark-50 rounded-bl-sm'
        } ${isClickable ? 'cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all' : ''}`}
      >
        {/* File content */}
        <div className="p-3 flex items-center gap-3">
          {/* File icon */}
          <div
            className={`flex-shrink-0 p-2 rounded-lg ${
              isMe ? 'bg-white/20' : 'bg-dark-300 dark:bg-dark-700'
            }`}
          >
            {downloadStatus === 'downloading' ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : downloadStatus === 'completed' ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : downloadStatus === 'failed' ? (
              <AlertCircle className="h-8 w-8 text-red-500" />
            ) : (
              getFileIcon(fileAttachment.type)
            )}
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileAttachment.name}</p>
            <p className={`text-xs ${isMe ? 'text-white/70' : 'text-dark-500 dark:text-dark-400'}`}>
              {formatFileSize(fileAttachment.size)}
              {downloadStatus === 'failed' && ' • Falha ao baixar'}
              {downloadStatus === 'completed' && ' • Baixado'}
            </p>
          </div>

          {/* Download indicator for received files */}
          {!isMe && downloadStatus === 'pending' && (
            <div className="flex-shrink-0">
              <Download className="h-5 w-5 text-primary-500" />
            </div>
          )}
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="px-3 pb-2">
            <div className="h-1 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="px-3 pb-2 flex justify-end items-center gap-1">
          <span className={`text-[10px] ${isMe ? 'text-white/70' : 'text-dark-500 dark:text-dark-400'}`}>
            {time}
          </span>
          {isMe && status && <StatusIcon status={status} />}
        </div>
      </div>
    )
  }

  // Regular text message
  return (
    <div
      className={`mb-3 max-w-[80%] px-4 py-2 rounded-2xl ${
        isMe
          ? 'ml-auto bg-primary-500 text-white rounded-br-sm'
          : 'mr-auto bg-dark-200 dark:bg-dark-800 text-dark-900 dark:text-dark-50 rounded-bl-sm'
      }`}
    >
      <p className="text-sm leading-relaxed mb-1 break-words whitespace-pre-wrap">{message}</p>
      <div className="flex justify-end items-center gap-1">
        <span className={`text-[10px] ${isMe ? 'text-white/70' : 'text-dark-500 dark:text-dark-400'}`}>
          {time}
        </span>
        {isMe && status && <StatusIcon status={status} />}
      </div>
    </div>
  )
}

function StatusIcon({ status }: { status: MessageStatus }) {
  return (
    <span className="flex items-center gap-0.5 text-[10px]">
      {status === 'sending' && (
        <svg
          className="h-3 w-3 text-white/70 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" className="opacity-20" />
          <path d="M12 2a10 10 0 0 1 10 10" className="opacity-90" />
        </svg>
      )}
      {status === 'sent' && (
        <svg className="h-3 w-3 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="m5 13 3.5 3.5L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {status === 'read' && (
        <svg className="h-3.5 w-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="m4.5 13.5 3.75 3.75L19.5 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m10 13.5 3.75 3.75L22 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}
