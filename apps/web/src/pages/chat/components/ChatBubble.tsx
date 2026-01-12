import { useState, useCallback, useRef, useEffect } from 'react'
import { Download, FileText, Play, ExternalLink, X, Loader2, Edit2, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useLongPress } from '@/hooks/useLongPress'

type MessageStatus = 'sending' | 'sent' | 'read'

async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = globalThis.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    globalThis.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Download failed:', error)
    globalThis.open(url, '_blank')
  }
}

export interface MessageAttachment {
  url: string
  name: string
  type: string
  size: number
}

interface ChatBubbleProps {
  readonly messageId: string
  readonly message: string
  readonly isMe: boolean
  readonly timestamp: string
  readonly status?: MessageStatus
  readonly attachment?: MessageAttachment
  readonly senderName?: string
  readonly senderColor?: string
  readonly isEdited?: boolean
  readonly deletedForEveryone?: boolean
  readonly onEdit?: (messageId: string, currentText: string) => void
  readonly onDelete?: (messageId: string, type: 'everyone' | 'me') => void
}

type MediaType = 'image' | 'video' | 'audio' | 'pdf' | 'document'

function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType === 'application/pdf') return 'pdf'
  return 'document'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTime(timestamp: string): string {
  let dateStr = timestamp
  if (
    typeof timestamp === 'string' &&
    !timestamp.endsWith('Z') &&
    !/[+-]\d{2}:?\d{2}$/.test(timestamp)
  ) {
    dateStr = `${timestamp}Z`
  }

  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '--:--'

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(date)
}

export function ChatBubble({
  messageId,
  message,
  isMe,
  timestamp,
  status,
  attachment,
  senderName,
  senderColor,
  isEdited,
  deletedForEveryone,
  onEdit,
  onDelete,
}: Readonly<ChatBubbleProps>) {
  const time = formatTime(timestamp)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const bubbleRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // Allow context menu if it's my message OR if I can delete (for me)
      if (!isMe && !onDelete) return

      // Prevent default browser context menu
      if (e.type === 'contextmenu') {
        e.preventDefault()
      }

      // Stop propagation
      e.stopPropagation()

      let clientX, clientY

      if ('touches' in e) {
        // Touch event
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        // Mouse event
        clientX = (e as React.MouseEvent).clientX
        clientY = (e as React.MouseEvent).clientY
      }

      const MENU_WIDTH = 180 // Approximate width (min-w-[160px] + padding)
      const MENU_HEIGHT = 120 // Approximate height
      const SCREEN_MARGIN = 16

      // Adjust X position
      let x = clientX
      if (globalThis.innerWidth && x + MENU_WIDTH > globalThis.innerWidth) {
        x = globalThis.innerWidth - MENU_WIDTH - SCREEN_MARGIN
      }
      // Ensure it doesn't go off left screen either
      if (x < SCREEN_MARGIN) {
        x = SCREEN_MARGIN
      }

      // Adjust Y position
      let y = clientY
      if (globalThis.innerHeight && y + MENU_HEIGHT > globalThis.innerHeight) {
        y = globalThis.innerHeight - MENU_HEIGHT - SCREEN_MARGIN
      }

      setContextMenuPosition({ x, y })
      setShowContextMenu(true)
    },
    [isMe, onDelete]
  )

  const longPressProps = useLongPress(handleContextMenu, {
    threshold: 500, // 500ms for long press
  })

  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(false)
    }
    if (showContextMenu) {
      globalThis.addEventListener('click', handleClickOutside)
      return () => globalThis.removeEventListener('click', handleClickOutside)
    }
  }, [showContextMenu])

  const handleEditClick = useCallback(() => {
    if (onEdit) {
      onEdit(messageId, message)
    }
    setShowContextMenu(false)
  }, [onEdit, messageId, message])

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShowContextMenu(false)
    setShowDeleteModal(true)
  }, [])

  const handleDelete = useCallback(
    (type: 'everyone' | 'me') => {
      if (onDelete) {
        onDelete(messageId, type)
        setShowDeleteModal(false)
      }
    },
    [messageId, onDelete]
  )

  if (deletedForEveryone) {
    return (
      <div className={`flex flex-col mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && senderName && (
          <span className="text-xs text-gray-400 mb-1 ml-1 block">{senderName}</span>
        )}
        <div
          ref={bubbleRef}
          role="button"
          tabIndex={0}
          className={`relative max-w-[85%] sm:max-w-[75%] px-4 py-2 rounded-2xl text-sm italic border select-none ${
            isMe
              ? 'bg-primary-50 border-primary-200 text-gray-500 rounded-tr-none'
              : 'bg-gray-50 border-gray-200 text-gray-500 rounded-tl-none'
          }`}
          style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' } as React.CSSProperties}
          onContextMenu={e => {
            e.preventDefault()
            handleContextMenu(e)
          }}
          {...longPressProps}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleContextMenu(e as unknown as React.MouseEvent)
            }
          }}
        >
          <div className="flex items-center gap-2">
            <X size={14} />
            <span>Mensagem excluída</span>
          </div>

          {/* Context Menu for deleted message (only delete for me) */}
          {showContextMenu && (
            <div
              role="menu"
              tabIndex={-1}
              className="fixed z-[9999] min-w-[160px] bg-white rounded-lg shadow-xl border border-gray-100 py-1"
              style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
              onClick={e => e.stopPropagation()}
              onKeyDown={e => {
                if (e.key === 'Escape') setShowContextMenu(false)
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => handleDelete('me')}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <Trash2 size={14} />
                Excluir para mim
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (attachment) {
    return (
      <AttachmentBubble
        attachment={attachment}
        isMe={isMe}
        time={time}
        status={status}
        senderName={senderName}
        senderColor={senderColor}
      />
    )
  }

  return (
    <>
      <div
        ref={bubbleRef}
        role="button"
        tabIndex={0}
        onContextMenu={e => {
          e.preventDefault()
          // Do NOT call handleContextMenu here to avoid double trigger with longPress
          // But for desktop right click we might want it.
          // useLongPress handles mouse down/up, but context menu event is separate.
          // Let's rely on longPressProps for consistency or handle context menu specifically for desktop right click?
          // Actually context menu event is good for right click.
          // But on mobile native context menu fires on long press.
          // If we prevent default here, native menu is blocked.
          // Then useLongPress triggers our menu.
          // For desktop right click, we need to manually trigger if useLongPress doesn't cover it (it covers left click hold).
          // Let's checking if event is right click?
          // native contextmenu event usually means right click on desktop.
          handleContextMenu(e)
        }}
        {...longPressProps}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleContextMenu(e as unknown as React.MouseEvent)
          }
        }}
        className={`mb-3 max-w-[80%] px-4 py-2 rounded-2xl cursor-pointer select-none ${
          isMe
            ? 'ml-auto bg-primary-500 text-white rounded-br-sm'
            : 'mr-auto bg-dark-200 dark:bg-dark-800 text-dark-900 dark:text-dark-50 rounded-bl-sm'
        }`}
        style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' } as React.CSSProperties}
      >
        {!isMe && senderName && (
          <p
            className={`text-xs font-bold mb-1 ${senderColor ?? 'text-primary-600 dark:text-primary-400'}`}
          >
            {senderName}
          </p>
        )}
        <p className="text-sm leading-relaxed mb-1 break-words whitespace-pre-wrap">{message}</p>
        <BubbleFooter time={time} isMe={isMe} status={status} isEdited={isEdited} />
      </div>
      {showContextMenu && (
        <div
          role="menu"
          tabIndex={-1}
          className="fixed z-50 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-dark-200 dark:border-dark-700 py-1 min-w-[160px]"
          style={{ left: `${contextMenuPosition.x}px`, top: `${contextMenuPosition.y}px` }}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => {
            if (e.key === 'Escape') setShowContextMenu(false)
          }}
        >
          {isMe && onEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={handleEditClick}
              className="w-full px-4 py-2 text-left text-sm hover:bg-dark-100 dark:hover:bg-dark-700 flex items-center gap-2 text-dark-900 dark:text-dark-50"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={handleDeleteClick}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir
            </div>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="" size="sm">
        <div className="flex flex-col items-center justify-center p-2 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <X className="w-6 h-6 text-red-600 dark:text-red-500" />
          </div>

          <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2">
            Excluir Mensagem
          </h3>

          <p className="text-sm text-dark-500 dark:text-dark-400 mb-6 max-w-[280px]">
            Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
          </p>

          <div className="flex flex-col gap-3 w-full">
            {/* Delete for Everyone - Only if I sent it */}
            {isMe && (
              <Button variant="danger" className="w-full" onClick={() => handleDelete('everyone')}>
                Excluir para todos
              </Button>
            )}

            {/* Delete for Me - Always available */}
            <Button
              variant={isMe ? 'outline' : 'danger'}
              className={`w-full ${isMe ? 'border-dark-200 text-dark-700 dark:border-dark-700 dark:text-dark-300' : ''}`}
              onClick={() => handleDelete('me')}
            >
              Excluir para mim
            </Button>

            {/* Cancel */}
            <Button variant="ghost" className="w-full" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

interface AttachmentBubbleProps {
  readonly attachment: MessageAttachment
  readonly isMe: boolean
  readonly time: string
  readonly status?: MessageStatus
  readonly senderName?: string
  readonly senderColor?: string
}

function AttachmentBubble({
  attachment,
  isMe,
  time,
  status,
  senderName,
  senderColor,
}: Readonly<AttachmentBubbleProps>) {
  const mediaType = getMediaType(attachment.type)

  const bubbleClass = `mb-3 max-w-[80%] rounded-2xl overflow-hidden ${
    isMe
      ? 'ml-auto bg-primary-500 text-white rounded-br-sm'
      : 'mr-auto bg-dark-200 dark:bg-dark-800 text-dark-900 dark:text-dark-50 rounded-bl-sm'
  }`

  return (
    <div className={bubbleClass}>
      {!isMe && senderName && (
        <div className="px-3 pt-2">
          <p
            className={`text-xs font-bold mb-1 ${senderColor ?? 'text-primary-600 dark:text-primary-400'}`}
          >
            {senderName}
          </p>
        </div>
      )}
      <MediaPreview attachment={attachment} mediaType={mediaType} isMe={isMe} />
      <div className="p-3">
        <MediaActions attachment={attachment} mediaType={mediaType} isMe={isMe} />
        <BubbleFooter time={time} isMe={isMe} status={status} />
      </div>
    </div>
  )
}

interface MediaPreviewProps {
  readonly attachment: MessageAttachment
  readonly mediaType: MediaType
  readonly isMe: boolean
}

function MediaPreview({ attachment, mediaType, isMe }: Readonly<MediaPreviewProps>) {
  switch (mediaType) {
    case 'image':
      return <ImagePreview url={attachment.url} name={attachment.name} />
    case 'video':
      return <VideoPreview url={attachment.url} isMe={isMe} />
    case 'audio':
      return <AudioPreview url={attachment.url} />
    case 'pdf':
      return <PdfPreview url={attachment.url} isMe={isMe} />
    default:
      return null
  }
}

function ImagePreview({ url, name }: Readonly<{ url: string; name: string }>) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <img src={url} alt={name} className="w-full max-h-64 object-cover" loading="lazy" />
    </a>
  )
}

function VideoPreview({ url, isMe }: Readonly<{ url: string; isMe: boolean }>) {
  const [showPlayer, setShowPlayer] = useState(false)

  const handlePlay = useCallback(() => setShowPlayer(true), [])
  const handleClose = useCallback(() => setShowPlayer(false), [])

  if (showPlayer) {
    return (
      <div className="relative">
        <video src={url} controls autoPlay className="w-full max-h-64 bg-black">
          <track kind="captions" />
        </video>
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      className="relative cursor-pointer group w-full block"
      onClick={handlePlay}
    >
      <video src={url} className="w-full max-h-64 object-cover bg-black" preload="metadata">
        <track kind="captions" />
      </video>
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
        <div className={`p-4 rounded-full ${isMe ? 'bg-white/90' : 'bg-primary-500'}`}>
          <Play className={`h-8 w-8 ${isMe ? 'text-primary-500' : 'text-white'} ml-1`} />
        </div>
      </div>
    </button>
  )
}

function AudioPreview({ url }: Readonly<{ url: string }>) {
  return (
    <div className="px-3 pt-3">
      <audio src={url} controls className="w-full h-10" preload="metadata">
        <track kind="captions" />
      </audio>
    </div>
  )
}

function PdfPreview({ url, isMe }: Readonly<{ url: string; isMe: boolean }>) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block relative">
      <div
        className={`h-32 flex items-center justify-center ${isMe ? 'bg-primary-600' : 'bg-dark-300 dark:bg-dark-700'}`}
      >
        <div className="text-center">
          <FileText
            className={`h-12 w-12 mx-auto mb-2 ${isMe ? 'text-white/80' : 'text-red-500'}`}
          />
          <span className={`text-xs font-medium ${isMe ? 'text-white/70' : 'text-dark-500'}`}>
            PDF Document
          </span>
        </div>
      </div>
    </a>
  )
}

interface MediaActionsProps {
  readonly attachment: MessageAttachment
  readonly mediaType: MediaType
  readonly isMe: boolean
}

function MediaActions({ attachment, mediaType, isMe }: Readonly<MediaActionsProps>) {
  switch (mediaType) {
    case 'image':
      return <ImageAction url={attachment.url} isMe={isMe} />
    case 'video':
    case 'audio':
      return <MediaInfoAction name={attachment.name} size={attachment.size} isMe={isMe} />
    default:
      return <DownloadAction attachment={attachment} isMe={isMe} />
  }
}

function ImageAction({ url, isMe }: Readonly<{ url: string; isMe: boolean }>) {
  return (
    <div className="flex items-center gap-2">
      <a
        href={url}
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
  )
}

function MediaInfoAction({
  name,
  size,
  isMe,
}: Readonly<{ name: string; size: number; isMe: boolean }>) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-xs truncate max-w-[70%] ${isMe ? 'text-white/80' : 'text-dark-600 dark:text-dark-400'}`}
      >
        {name}
      </span>
      <span className={`text-xs ${isMe ? 'text-white/60' : 'text-dark-500'}`}>
        {formatFileSize(size)}
      </span>
    </div>
  )
}

function DownloadAction({
  attachment,
  isMe,
}: Readonly<{ attachment: MessageAttachment; isMe: boolean }>) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    await downloadFile(attachment.url, attachment.name)
    setIsDownloading(false)
  }, [attachment.url, attachment.name])

  const iconClass = `h-5 w-5 flex-shrink-0 ${isMe ? 'text-white/80' : 'text-primary-500'}`

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${
        isMe ? 'hover:bg-white/10' : 'hover:bg-dark-300 dark:hover:bg-dark-700'
      } ${isDownloading ? 'opacity-70 cursor-wait' : ''}`}
    >
      <div
        className={`flex-shrink-0 p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-dark-300 dark:bg-dark-700'}`}
      >
        <FileText className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className={`text-xs ${isMe ? 'text-white/70' : 'text-dark-500 dark:text-dark-400'}`}>
          {formatFileSize(attachment.size)}
        </p>
      </div>
      {isDownloading ? (
        <Loader2 className={`${iconClass} animate-spin`} />
      ) : (
        <Download className={iconClass} />
      )}
    </button>
  )
}

interface BubbleFooterProps {
  readonly time: string
  readonly isMe: boolean
  readonly status?: MessageStatus
  readonly isEdited?: boolean
}

function BubbleFooter({ time, isMe, status, isEdited }: Readonly<BubbleFooterProps>) {
  return (
    <div className="flex justify-end items-center gap-1 mt-1">
      {isEdited && (
        <span
          className={`text-[10px] italic ${isMe ? 'text-white/60' : 'text-dark-400 dark:text-dark-500'}`}
        >
          editada
        </span>
      )}
      <span
        className={`text-[10px] ${isMe ? 'text-white/70' : 'text-dark-500 dark:text-dark-400'}`}
      >
        {time}
      </span>
      {isMe && status && <StatusIcon status={status} />}
    </div>
  )
}

function StatusIcon({ status }: Readonly<{ status: MessageStatus }>) {
  if (status === 'sending') {
    return (
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
    )
  }

  if (status === 'sent') {
    return (
      <svg className="h-3 w-3 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="m5 13 3.5 3.5L19 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (status === 'read') {
    return (
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
    )
  }

  return null
}
