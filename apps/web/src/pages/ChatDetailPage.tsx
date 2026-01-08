import { useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChatBubble } from './chat/components/ChatBubble'
import { ChatInput } from './chat/components/ChatInput'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/contexts/AuthContext'

export default function ChatDetailPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  // Guard to prevent race conditions where conversations update before activeConversation state
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
    // ... existing logic ...
    if (conversationId && conversations.length > 0) {
      // If we already intend to be on this conversation, ignore updates until activeConversation catches up
      // or if we are already on it
      if (
        intendedConversationIdRef.current === conversationId &&
        activeConversation?.id !== conversationId
      ) {
        return
      }

      // Update active conversation if it doesn't match the URL
      if (activeConversation?.id === conversationId) {
        // We are synced
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intendedConversationIdRef.current = null
      setActiveConversation(null)
    }
  }, [setActiveConversation])

  // MutationObserver to detect DOM changes and auto-scroll (ONLY for new messages at bottom)
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const observer = new MutationObserver(mutations => {
      // If we are loading history, DO NOT auto-scroll to bottom
      if (isLoadingMoreMessages) return

      let hasChanges = false
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
          hasChanges = true
          break
        }
      }

      if (hasChanges) {
        // Only scroll if we were already near bottom OR it's a new message (logic can be refined)
        // For now, let's keep it simple: if not loading history, scroll to bottom
        forceScroll()
      }
    })

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    })

    return () => {
      observer.disconnect()
    }
  }, [forceScroll, isLoadingMoreMessages])

  // ... (rest of effects) ...

  // Force initial scroll to bottom when container mounts (BEFORE paint)
  useLayoutEffect(() => {
    if (messagesContainerRef.current) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
      }, 0)
    }
  }, [conversationId])

  // Force scroll on mount - runs after first render
  useLayoutEffect(() => {
    forceScroll()
    requestAnimationFrame(forceScroll)
  }, [forceScroll])

  // Also force scroll AFTER paint to catch any late DOM updates
  useEffect(() => {
    requestAnimationFrame(forceScroll)
    const timers = [0, 10, 50, 100, 200, 300, 500, 1000].map(delay =>
      setTimeout(forceScroll, delay)
    )

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [conversationId, forceScroll])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    requestAnimationFrame(forceScroll)
    scrollTimeoutRef.current = setTimeout(forceScroll, 0)
    setTimeout(forceScroll, 10)
    setTimeout(forceScroll, 50)
    setTimeout(forceScroll, 100)
    setTimeout(forceScroll, 200)
    setTimeout(forceScroll, 300)
    setTimeout(forceScroll, 500)

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [messages, forceScroll])

  // Scroll to bottom when messages finish loading
  useEffect(() => {
    if (!isLoadingMessages && messages.length > 0) {
      requestAnimationFrame(forceScroll)
      setTimeout(forceScroll, 0)
      setTimeout(forceScroll, 50)
      setTimeout(forceScroll, 150)
      setTimeout(forceScroll, 300)
      setTimeout(forceScroll, 500)
    }
  }, [isLoadingMessages, messages.length, forceScroll])

  const handleSend = async (text: string) => {
    if (text.trim()) {
      await sendMessage(text)
      requestAnimationFrame(forceScroll)
      setTimeout(forceScroll, 0)
      setTimeout(forceScroll, 10)
      setTimeout(forceScroll, 50)
      setTimeout(forceScroll, 100)
      setTimeout(forceScroll, 200)
      setTimeout(forceScroll, 300)
    }
  }

  // Fallback: If activeConversation is missing (e.g. during updates), try to find it in the list
  const currentConversation = activeConversation || conversations.find(c => c.id === conversationId)
  const otherUser = currentConversation?.participants.find(p => p.id !== user?.id)

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
        {messages.map(message => (
          <ChatBubble
            key={message.id}
            message={message.text}
            isMe={message.senderId === user?.id}
            timestamp={message.createdAt}
          />
        ))}
        {/* Spacer to ensure last message aligns with input footer */}
        <div className="h-4" />
        <div ref={messagesEndRef} className="h-0" />
      </>
    )
  }

  if (!currentConversation || !otherUser) {
    if (isLoadingMessages) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )
    }
    // If not found in conversations list (and check logic finished), show not found
    // Or it might be loading conversations?
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-dark-400 dark:text-dark-500">
          {conversations.length === 0 ? 'Carregando...' : 'Conversa não encontrada'}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bottom-[3.8rem] flex flex-col bg-gray-50 dark:bg-dark-950 overflow-hidden z-40">
        {/* Header */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-dark-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:dark:bg-dark-950/80 border-b border-dark-200 dark:border-dark-800 safe-area-top pt-[env(safe-area-inset-top,0px)]">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => {
                setActiveConversation(null)
                navigate('/chat')
              }}
              className="p-2 -ml-2 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50 transition-colors rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 active:scale-95"
              aria-label="Voltar"
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

            <div className="relative flex-shrink-0">
              <img
                src={
                  otherUser.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}`
                }
                alt={otherUser.name}
                className="w-10 h-10 rounded-full bg-dark-200 dark:bg-dark-800"
              />
              {otherUser.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-900" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-dark-900 dark:text-dark-50 truncate">
                {otherUser.name}
              </h2>
              {otherUser.isOnline && <p className="text-xs text-green-500">Online</p>}
            </div>

            <button
              className="p-2 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50 transition-colors"
              aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Container - Only this should scroll */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 bg-gray-50 dark:bg-dark-950 min-h-0 touch-pan-y"
          style={{
            display: 'flex',
            flexDirection: 'column',
            WebkitOverflowScrolling: 'touch', // Enable momentum scrolling on iOS
          }}
        >
          <div className="py-4 min-h-[100%] flex flex-col justify-end">
            {isLoadingMoreMessages && (
              <div className="flex justify-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              </div>
            )}
            {renderMessages()}
          </div>
        </div>

        {/* Input Footer */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-dark-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:dark:bg-dark-950/80 border-t border-dark-200 dark:border-dark-800 pb-2">
          <ChatInput onSend={handleSend} />
        </div>
      </div>

      {/* Desktop View */}
      {/* Desktop View */}
      {/* Desktop View */}
      <main className="hidden lg:block w-full h-full p-4 bg-gray-50 dark:bg-dark-950">
        <div className="h-full w-full">
          <div className="w-full h-full bg-white dark:bg-dark-900 rounded-2xl border border-gray-200 dark:border-dark-800 shadow-xl shadow-gray-200/50 dark:shadow-black/40 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-dark-800 flex-shrink-0 bg-white/50 dark:bg-dark-900/50 backdrop-blur-sm">
              <button
                onClick={() => {
                  setActiveConversation(null)
                  navigate('/chat')
                }}
                className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800"
                aria-label="Voltar"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="relative flex-shrink-0">
                <img
                  src={
                    otherUser.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}`
                  }
                  alt={otherUser.name}
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-800 object-cover shadow-sm"
                />
                {otherUser.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-900 shadow-sm" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2">
                  {otherUser.name}
                </h2>
                {otherUser.isOnline && (
                  <p className="text-xs font-medium text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Online
                  </p>
                )}
              </div>

              <button
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                aria-label="Menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/50 dark:bg-dark-950/50"
            >
              <div className="space-y-4 min-h-full flex flex-col">
                {isLoadingMoreMessages && (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                  </div>
                )}
                {renderMessages()}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 dark:border-dark-800 flex-shrink-0 bg-white dark:bg-dark-900 p-1">
              <ChatInput onSend={handleSend} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
