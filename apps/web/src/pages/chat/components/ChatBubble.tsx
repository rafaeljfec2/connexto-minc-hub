import { useState, useCallback } from 'react'
import { Download, FileText, Play, ExternalLink, X, Loader2 } from 'lucide-react'

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
  readonly message: string
  readonly isMe: boolean
  readonly timestamp: string
  readonly status?: MessageStatus
  readonly attachment?: MessageAttachment
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
  message,
  isMe,
  timestamp,
  status,
  attachment,
}: Readonly<ChatBubbleProps>) {
  const time = formatTime(timestamp)

  if (attachment) {
    return <AttachmentBubble attachment={attachment} isMe={isMe} time={time} status={status} />
  }

  return (
    <div
      className={`mb-3 max-w-[80%] px-4 py-2 rounded-2xl ${
        isMe
          ? 'ml-auto bg-primary-500 text-white rounded-br-sm'
          : 'mr-auto bg-dark-200 dark:bg-dark-800 text-dark-900 dark:text-dark-50 rounded-bl-sm'
      }`}
    >
      <p className="text-sm leading-relaxed mb-1 break-words whitespace-pre-wrap">{message}</p>
      <BubbleFooter time={time} isMe={isMe} status={status} />
    </div>
  )
}

interface AttachmentBubbleProps {
  readonly attachment: MessageAttachment
  readonly isMe: boolean
  readonly time: string
  readonly status?: MessageStatus
}

function AttachmentBubble({ attachment, isMe, time, status }: Readonly<AttachmentBubbleProps>) {
  const mediaType = getMediaType(attachment.type)

  const bubbleClass = `mb-3 max-w-[80%] rounded-2xl overflow-hidden ${
    isMe
      ? 'ml-auto bg-primary-500 text-white rounded-br-sm'
      : 'mr-auto bg-dark-200 dark:bg-dark-800 text-dark-900 dark:text-dark-50 rounded-bl-sm'
  }`

  return (
    <div className={bubbleClass}>
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
}

function BubbleFooter({ time, isMe, status }: Readonly<BubbleFooterProps>) {
  return (
    <div className="flex justify-end items-center gap-1 mt-1">
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
