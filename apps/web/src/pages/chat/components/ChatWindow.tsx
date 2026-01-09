import { useRef, useEffect, useLayoutEffect, useCallback } from 'react'

import { ChatBubble } from './ChatBubble'
import { ChatInput } from './ChatInput'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/Avatar'

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

          return (
            <ChatBubble
              key={message.id}
              message={message.text}
              isMe={isMe}
              timestamp={message.createdAt}
              status={status}
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
      <div className="flex-shrink-0 bg-white/95 dark:bg-dark-950/95 backdrop-blur border-b border-dark-200 dark:border-dark-800 p-3 flex items-center gap-3">
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

      {/* Input */}
      <div className="flex-shrink-0 bg-white dark:bg-dark-950 border-t border-dark-200 dark:border-dark-800 pb-[env(safe-area-inset-bottom)]">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  )
}
