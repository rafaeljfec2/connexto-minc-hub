import { useRef, useEffect, useLayoutEffect, useCallback, useState, useMemo } from 'react'
import { Info, Users, Loader2 } from 'lucide-react'

import { ChatBubble } from './ChatBubble'
import { ChatInput } from './ChatInput'
import { GroupDetailsModal } from './GroupDetailsModal'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { uploadChatFile, UploadProgress } from '@/services/upload.service'

interface ChatWindowProps {
  readonly conversationId: string
  readonly onBack?: () => void
}

// Helper to get message status
function getMessageStatus(
  isMe: boolean,
  messageId: string,
  isRead: boolean
): 'sending' | 'sent' | 'read' | undefined {
  if (!isMe) return undefined
  if (messageId.startsWith('temp-')) return 'sending'
  if (isRead) return 'read'
  return 'sent'
}

const SENDER_COLORS = [
  'text-red-500',
  'text-orange-500',
  'text-amber-500',
  'text-green-500',
  'text-emerald-500',
  'text-teal-500',
  'text-cyan-500',
  'text-blue-500',
  'text-indigo-500',
  'text-violet-500',
  'text-purple-500',
  'text-fuchsia-500',
  'text-pink-500',
  'text-rose-500',
]

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

  // Upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isGroupDetailsOpen, setIsGroupDetailsOpen] = useState(false)

  // Edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  // Memoize sender colors
  const senderColors = useMemo(() => {
    const colors = new Map<string, string>()
    if (activeConversation?.type === 'group') {
      activeConversation.participants.forEach((p, index) => {
        colors.set(p.id, SENDER_COLORS[index % SENDER_COLORS.length])
      })
    }
    return colors
  }, [activeConversation])

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

      if (scrollDiff > 0) {
        container.scrollTop = scrollDiff
      }

      previousScrollHeightRef.current = null
    }
  }, [messages])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

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

    if (file) {
      setIsUploading(true)
      setUploadProgress(0)

      try {
        // Upload file to Cloudinary
        const uploadResult = await uploadChatFile(file, (progress: UploadProgress) => {
          setUploadProgress(progress.percentage)
        })

        // Send message with attachment data
        await sendMessage(`📎 ${file.name}`, {
          attachmentUrl: uploadResult.url,
          attachmentName: uploadResult.originalName,
          attachmentType: uploadResult.mimeType,
          attachmentSize: uploadResult.bytes,
        })

        requestAnimationFrame(forceScroll)
        setTimeout(forceScroll, 100)
      } catch (error) {
        console.error('Failed to upload file:', error)
        sendMessage('❌ Falha ao enviar arquivo')
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    }
  }

  const handleEditMessage = useCallback((messageId: string, currentText: string) => {
    setEditingMessageId(messageId)
    setEditingText(currentText)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null)
    setEditingText('')
  }, [])

  const handleSaveEdit = useCallback(
    async (newText: string) => {
      if (!editingMessageId || !newText.trim()) return

      try {
        // Call API to update message
        const { ChatApiService } = await import('@minc-hub/shared')
        const { api } = await import('@/lib/api')
        const chatApi = new ChatApiService(api)

        await chatApi.updateMessage(editingMessageId, newText.trim())

        setEditingMessageId(null)
        setEditingText('')
      } catch (error) {
        console.error('Failed to edit message:', error)
      }
    },
    [editingMessageId]
  )

  const handleDeleteMessage = useCallback(async (messageId: string, type: 'everyone' | 'me') => {
    try {
      const { ChatApiService } = await import('@minc-hub/shared')
      const { api } = await import('@/lib/api')
      const chatApi = new ChatApiService(api)

      await chatApi.deleteMessage(messageId, type)
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }, [])

  // Fallback: If activeConversation is missing, try to find it in the list
  const currentConversation = activeConversation || conversations.find(c => c.id === conversationId)

  // Header Info Logic
  const isGroup = currentConversation?.type === 'group'
  let headerTitle = 'Conversa'
  let headerSubtitle = ''
  let headerAvatar: string | undefined = undefined

  if (currentConversation) {
    if (isGroup) {
      headerTitle = currentConversation.name || 'Grupo'
      headerSubtitle = `${currentConversation.participants.length} participantes`
      // headerAvatar could be group image if supported in future
    } else {
      const otherUser = currentConversation.participants.find(p => p.id !== user?.id)
      headerTitle = otherUser?.name || 'Desconhecido'
      headerSubtitle = otherUser?.isOnline ? 'Online' : ''
      headerAvatar = otherUser?.avatar ?? undefined
    }
  }

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
        {messages
          .filter(message => !message.deletedBy?.includes(user?.id || ''))
          .map(message => {
            const isMe = message.senderId === user?.id
            const status = getMessageStatus(isMe, message.id, message.read)

            const sender =
              isGroup && !isMe
                ? currentConversation?.participants.find(p => p.id === message.senderId)
                : undefined

            return (
              <ChatBubble
                key={message.id}
                messageId={message.id}
                message={message.text}
                isMe={isMe}
                timestamp={message.createdAt}
                status={status}
                senderName={sender?.name}
                senderColor={sender ? senderColors.get(sender.id) : undefined}
                isEdited={message.isEdited}
                deletedForEveryone={message.deletedForEveryone}
                onEdit={isMe ? handleEditMessage : undefined}
                onDelete={handleDeleteMessage}
                attachment={
                  message.attachmentUrl
                    ? {
                        url: message.attachmentUrl,
                        name: message.attachmentName ?? 'arquivo',
                        type: message.attachmentType ?? 'application/octet-stream',
                        size: message.attachmentSize ?? 0,
                      }
                    : undefined
                }
              />
            )
          })}
        {/* Spacer */}
        <div className="h-4" />
        <div ref={messagesEndRef} />
      </>
    )
  }

  if (!currentConversation) {
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

  const handleSendAudio = async (file: Blob, _duration: number) => {
    if (!activeConversation) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      // Ensure file has a name and type
      const audioFile = new File([file], 'audio_message.webm', { type: 'audio/webm' })
      formData.append('file', audioFile)

      const { api } = await import('@/lib/api')
      // Remove Content-Type header to let browser set it with boundary
      await api.post(`/chat/conversations/${activeConversation.id}/messages/audio`, formData, {
        headers: {
          'Content-Type': undefined,
        },
      })

      requestAnimationFrame(forceScroll)
      setTimeout(forceScroll, 100)
    } catch (error) {
      console.error('Failed to send audio:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col h-full bg-white dark:bg-dark-950 relative overflow-hidden">
        {/* Chat Background Fixed */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/background-chat.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Theme Overlay */}
        <div className="absolute inset-0 z-0 bg-white/95 dark:bg-dark-950/80 pointer-events-none" />

        {/* Header */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-dark-950/95 backdrop-blur border-b border-dark-200 dark:border-dark-800 p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] lg:pt-3 flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            {onBack && (
              <button
                onClick={handleBackClick}
                className="p-2 -ml-2 text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg lg:hidden flex-shrink-0"
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

            {isGroup ? (
              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                <Users className="h-5 w-5" />
              </div>
            ) : (
              <Avatar
                src={headerAvatar}
                name={headerTitle}
                isOnline={currentConversation?.participants.find(p => p.id !== user?.id)?.isOnline}
                size="md"
              />
            )}

            <div className="min-w-0">
              <h2 className="text-base font-semibold text-dark-900 dark:text-dark-50 truncate">
                {headerTitle}
              </h2>
              {headerSubtitle && (
                <p
                  className={`text-xs ${headerSubtitle === 'Online' ? 'text-green-500' : 'text-dark-500'} truncate`}
                >
                  {headerSubtitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsGroupDetailsOpen(true)}
            className="p-2 text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-full transition-colors flex-shrink-0"
            aria-label="Dados da conversa"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-16 relative z-10"
        >
          <div className="py-4 min-h-full flex flex-col justify-end">{renderMessages()}</div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="flex-shrink-0 bg-white dark:bg-dark-900 border-t border-dark-200 dark:border-dark-800 px-4 py-2 relative z-10">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
              <div className="flex-1">
                <div className="h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-dark-500">{uploadProgress}%</span>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex-shrink-0 bg-white dark:bg-dark-950 border-t border-dark-200 dark:border-dark-800 pb-[env(safe-area-inset-bottom)] relative z-10">
          <ChatInput
            onSend={handleSend}
            onSendAudio={handleSendAudio}
            onAttachment={handleAttachment}
            editMode={!!editingMessageId}
            editText={editingText}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
          />
        </div>
      </div>

      {isGroup && currentConversation && (
        <GroupDetailsModal
          isOpen={isGroupDetailsOpen}
          onClose={() => setIsGroupDetailsOpen(false)}
          conversation={currentConversation}
        />
      )}
    </>
  )
}
