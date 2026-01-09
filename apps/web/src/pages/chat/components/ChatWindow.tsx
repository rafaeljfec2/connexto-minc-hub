import { useRef, useEffect, useLayoutEffect, useCallback, useState } from 'react'

import { ChatBubble, FileAttachment } from './ChatBubble'
import { ChatInput } from './ChatInput'
import { FileTransferProgress } from './FileTransferProgress'
import { IncomingTransferModal } from './IncomingTransferModal'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { useFileTransfer } from '@/contexts/FileTransferContext'

// Pattern to detect file messages: [FILE]{"name":"...","size":123,"type":"..."}
const FILE_MESSAGE_PATTERN = /^\[FILE\](\{.*\})$/

interface ParsedFileInfo {
  name: string
  size: number
  type: string
}

function parseFileMessage(text: string): ParsedFileInfo | null {
  const match = text.match(FILE_MESSAGE_PATTERN)
  if (!match) return null
  try {
    return JSON.parse(match[1]) as ParsedFileInfo
  } catch {
    return null
  }
}

interface ChatWindowProps {
  conversationId: string
  onBack?: () => void
}

export function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const intendedConversationIdRef = useRef<string | null>(null)
  const previousScrollHeightRef = useRef<number | null>(null)

  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    isLoadingMessages,
    hasMoreMessages,
    isLoadingMoreMessages,
    loadMoreMessages,
  } = useChat()
  const { user } = useAuth()

  // File transfer context - may not be available if not wrapped in provider
  const fileTransferContext = (() => {
    try {
      return useFileTransfer()
    } catch {
      return null
    }
  })()

  const activeTransfers = fileTransferContext?.activeTransfers ?? []
  const incomingRequest = fileTransferContext?.incomingRequest ?? null

  // Track download progress per message
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({})

  // Handler for requesting file download from sender (when clicking on file bubble)
  const handleRequestFileDownload = useCallback(
    async (senderId: string, fileInfo: FileAttachment) => {
      if (!fileTransferContext) {
        console.error('File transfer not available')
        return
      }

      console.log('[ChatWindow] Requesting file from:', senderId, fileInfo)

      // Request the file from the sender via WebRTC
      // The sender needs to be online for this to work
      try {
        await fileTransferContext.requestFile(senderId, {
          name: fileInfo.name,
          size: fileInfo.size,
          type: fileInfo.type,
        })
      } catch (error) {
        console.error('Failed to request file:', error)
        throw error
      }
    },
    [fileTransferContext]
  )

  // Handler for downloading received files (from transfer progress panel)
  const handleDownloadReceivedFile = useCallback(
    (transferId: string) => {
      fileTransferContext?.downloadFile(transferId)
    },
    [fileTransferContext]
  )

  // Update download progress from active transfers
  useEffect(() => {
    const newProgress: Record<string, number> = {}
    for (const transfer of activeTransfers) {
      if (transfer.direction === 'download') {
        newProgress[`${transfer.peerId}-${transfer.fileName}`] = transfer.progress
      }
    }
    setDownloadProgress(newProgress)
  }, [activeTransfers])

  // Common scroll logic
  const forceScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [])

  // Restore scroll position when loading more messages
  useLayoutEffect(() => {
    if (previousScrollHeightRef.current !== null && messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const newScrollHeight = container.scrollHeight
      const scrollDiff = newScrollHeight - previousScrollHeightRef.current

      // Only adjust if content grew
      if (scrollDiff > 0) {
        container.scrollTop = scrollDiff
      }

      previousScrollHeightRef.current = null
    }
  }, [messages])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    // Allow a small threshold (e.g. 50px) to trigger loading before hitting hard top
    if (container.scrollTop < 50 && hasMoreMessages && !isLoadingMoreMessages) {
      previousScrollHeightRef.current = container.scrollHeight
      loadMoreMessages()
    }
  }, [hasMoreMessages, isLoadingMoreMessages, loadMoreMessages])

  // Set active conversation on mount or change
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      if (
        intendedConversationIdRef.current === conversationId &&
        activeConversation?.id !== conversationId
      ) {
        return
      }

      if (activeConversation?.id === conversationId) {
        intendedConversationIdRef.current = conversationId
      } else {
        const conversation = conversations.find(c => c.id === conversationId)
        if (conversation) {
          intendedConversationIdRef.current = conversationId
          setActiveConversation(conversation)
        }
      }
    }
  }, [conversationId, conversations, activeConversation, setActiveConversation])

  // Handle back button - clear active conversation
  const handleBackClick = useCallback(() => {
    setActiveConversation(null)
    onBack?.()
  }, [setActiveConversation, onBack])

  // Force initial scroll to bottom when container mounts
  useLayoutEffect(() => {
    if (messagesContainerRef.current) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
      }, 0)
    }
  }, [conversationId])

  // Auto-scroll to bottom when messages change (new messages)
  useEffect(() => {
    if (!isLoadingMoreMessages) {
      requestAnimationFrame(forceScroll)
      setTimeout(forceScroll, 100)
    }
  }, [messages, forceScroll, isLoadingMoreMessages])

  const handleSend = async (text: string) => {
    if (text.trim()) {
      await sendMessage(text)
      requestAnimationFrame(forceScroll)
      setTimeout(forceScroll, 100)
    }
  }

  const handleAttachment = async (
    type: 'camera' | 'gallery' | 'document' | 'location',
    file?: File
  ) => {
    if (type === 'location') {
      // Handle location sharing
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords
            const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
            sendMessage(`📍 Localização: ${locationUrl}`)
            requestAnimationFrame(forceScroll)
            setTimeout(forceScroll, 100)
          },
          error => {
            console.error('Geolocation error:', error)
            sendMessage('❌ Não foi possível obter a localização')
          }
        )
      }
      return
    }

    if (file && otherUser) {
      // Send file message with structured format for P2P download
      const fileMessage = `[FILE]${JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type,
      })}`
      sendMessage(fileMessage)

      // If file transfer context is available, register the file for P2P sharing
      if (fileTransferContext) {
        try {
          fileTransferContext.registerFileForSharing(file)
          console.log(`[P2P] File registered for sharing: ${file.name}`)
        } catch (error) {
          console.error('[P2P] Failed to register file for sharing:', error)
        }
      }

      requestAnimationFrame(forceScroll)
      setTimeout(forceScroll, 100)
    }
  }

  // File transfer handlers
  const handleCancelTransfer = (transferId: string) => {
    fileTransferContext?.cancelTransfer(transferId)
  }

  const handleAcceptTransfer = () => {
    if (incomingRequest) {
      fileTransferContext?.acceptTransfer(incomingRequest.transferId)
    }
  }

  const handleRejectTransfer = () => {
    if (incomingRequest) {
      fileTransferContext?.rejectTransfer(incomingRequest.transferId)
    }
  }

  // Fallback: If activeConversation is missing (e.g. during updates), try to find it in the list
  const currentConversation = activeConversation || conversations.find(c => c.id === conversationId)
  const otherUser = currentConversation?.participants.find(p => p.id !== user?.id)
  const otherUserName = otherUser?.name || 'Desconhecido'

  const renderMessages = () => {
    if (isLoadingMessages && messages.length === 0) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
        </div>
      )
    }

    if (messages.length === 0) {
      return (
        <div className="flex items-center justify-center flex-1">
          <p className="text-dark-400 dark:text-dark-500 text-sm">
            Nenhuma mensagem ainda. Comece a conversa!
          </p>
        </div>
      )
    }

    return (
      <>
        {isLoadingMoreMessages && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
          </div>
        )}
        {messages.map(message => {
          const isMe = message.senderId === user?.id
          const status = isMe
            ? message.id.startsWith('temp-')
              ? 'sending'
              : message.read
                ? 'read'
                : 'sent'
            : undefined

          // Check if this is a file message
          const fileInfo = parseFileMessage(message.text)
          const fileAttachment: FileAttachment | undefined = fileInfo
            ? {
                ...fileInfo,
                senderId: message.senderId,
              }
            : undefined

          // Get download progress for this file
          const progressKey = fileAttachment ? `${message.senderId}-${fileAttachment.name}` : ''
          const progress = downloadProgress[progressKey]

          return (
            <ChatBubble
              key={message.id}
              message={fileInfo ? `📎 ${fileInfo.name}` : message.text}
              isMe={isMe}
              timestamp={message.createdAt}
              status={status}
              fileAttachment={fileAttachment}
              onDownloadFile={handleRequestFileDownload}
              downloadProgress={progress}
            />
          )
        })}
        {/* Spacer */}
        <div className="h-4" />
        <div ref={messagesEndRef} />
      </>
    )
  }

  if (!currentConversation || !otherUser) {
    if (isLoadingMessages) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-dark-400 dark:text-dark-500">Conversa não encontrada</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/95 dark:bg-dark-950/95 backdrop-blur border-b border-dark-200 dark:border-dark-800 p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center gap-3">
        {onBack && (
          <button
            onClick={handleBackClick}
            className="p-2 -ml-2 text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        <Avatar
          src={otherUser.avatar}
          name={otherUserName}
          isOnline={otherUser.isOnline}
          size="md"
        />

        <div>
          <h2 className="text-base font-semibold text-dark-900 dark:text-dark-50">
            {otherUserName}
          </h2>
          {otherUser.isOnline && <p className="text-xs text-green-500">Online</p>}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4"
      >
        <div className="py-4 min-h-full flex flex-col justify-end">{renderMessages()}</div>
      </div>

      {/* File Transfer Progress */}
      {activeTransfers.length > 0 && (
        <FileTransferProgress
          transfers={activeTransfers}
          onCancel={handleCancelTransfer}
          onDownload={handleDownloadReceivedFile}
        />
      )}

      {/* Input */}
      <div className="flex-shrink-0 bg-white dark:bg-dark-950 border-t border-dark-200 dark:border-dark-800 pb-[env(safe-area-inset-bottom)]">
        <ChatInput onSend={handleSend} onAttachment={handleAttachment} />
      </div>

      {/* Incoming Transfer Modal */}
      {incomingRequest && (
        <IncomingTransferModal
          isOpen={!!incomingRequest}
          fromUserName={incomingRequest.fromUserName ?? 'Unknown'}
          fileInfo={incomingRequest.fileInfo}
          onAccept={handleAcceptTransfer}
          onReject={handleRejectTransfer}
        />
      )}
    </div>
  )
}
