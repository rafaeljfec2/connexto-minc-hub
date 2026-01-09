import { Download, FileText, Image as ImageIcon, Film, Music, ExternalLink } from 'lucide-react'

type MessageStatus = 'sending' | 'sent' | 'read'

export interface MessageAttachment {
  url: string
  name: string
  type: string
  size: number
}

interface ChatBubbleProps {
  readonly message: string
  readonly isMe: boolean
  readonly timestamp: string
  readonly status?: MessageStatus
  readonly attachment?: MessageAttachment
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />
  if (mimeType.startsWith('video/')) return <Film className="h-5 w-5" />
  if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5" />
  return <FileText className="h-5 w-5" />
}

function isImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

export function ChatBubble({
  message,
  isMe,
  timestamp,
  status,
  attachment,
}: ChatBubbleProps) {
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

  const handleDownload = () => {
    if (attachment?.url) {
      window.open(attachment.url, '_blank')
    }
  }

  // Render attachment bubble
  if (attachment) {
    const isImage = isImageType(attachment.type)

    return (
      <div
        className={`mb-3 max-w-[80%] rounded-2xl overflow-hidden ${
          isMe
            ? 'ml-auto bg-primary-500 text-white rounded-br-sm'
            : 'mr-auto bg-dark-200 dark:bg-dark-800 text-dark-900 dark:text-dark-50 rounded-bl-sm'
        }`}
      >
        {/* Image preview */}
        {isImage && (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-full max-h-64 object-cover"
              loading="lazy"
            />
          </a>
        )}

        {/* File info */}
        <div className="p-3">
          {!isImage && (
            <button
              onClick={handleDownload}
              className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${
                isMe
                  ? 'hover:bg-white/10'
                  : 'hover:bg-dark-300 dark:hover:bg-dark-700'
              }`}
            >
              <div
                className={`flex-shrink-0 p-2 rounded-lg ${
                  isMe ? 'bg-white/20' : 'bg-dark-300 dark:bg-dark-700'
                }`}
              >
                {getFileIcon(attachment.type)}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{attachment.name}</p>
                <p
                  className={`text-xs ${
                    isMe ? 'text-white/70' : 'text-dark-500 dark:text-dark-400'
                  }`}
                >
                  {formatFileSize(attachment.size)}
                </p>
              </div>

              <Download
                className={`h-5 w-5 flex-shrink-0 ${
                  isMe ? 'text-white/80' : 'text-primary-500'
                }`}
              />
            </button>
          )}

          {/* Image caption / filename */}
          {isImage && (
            <div className="flex items-center gap-2">
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 text-xs ${
                  isMe ? 'text-white/80 hover:text-white' : 'text-primary-500 hover:text-primary-600'
                }`}
              >
                <ExternalLink className="h-3 w-3" />
                <span>Abrir imagem</span>
              </a>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex justify-end items-center gap-1 mt-1">
            <span
              className={`text-[10px] ${
                isMe ? 'text-white/70' : 'text-dark-500 dark:text-dark-400'
              }`}
            >
              {time}
            </span>
            {isMe && status && <StatusIcon status={status} />}
          </div>
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
        <span
          className={`text-[10px] ${isMe ? 'text-white/70' : 'text-dark-500 dark:text-dark-400'}`}
        >
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
        <svg
          className="h-3 w-3 text-white/70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="m5 13 3.5 3.5L19 6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {status === 'read' && (
        <svg
          className="h-3.5 w-3.5 text-green-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="m4.5 13.5 3.75 3.75L19.5 6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m10 13.5 3.75 3.75L22 8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}
