import { useRef, useEffect, useLayoutEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChatBubble } from './chat/components/ChatBubble'
import { ChatInput } from './chat/components/ChatInput'
import { useChat } from '@/contexts/ChatContext'
import { useAuth } from '@/contexts/AuthContext'

export default function ChatDetailPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    isLoadingMessages,
  } = useChat()
  const { user } = useAuth()

  // Set active conversation on mount
  // Only set when conversationId changes, not when conversations array updates
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      // Only update if the active conversation ID doesn't match
      // This prevents re-fetching when conversations array updates due to new messages
      if (activeConversation?.id !== conversationId) {
        const conversation = conversations.find(c => c.id === conversationId)
        if (conversation) {
          setActiveConversation(conversation)
        }
      }
    }

    // Cleanup on unmount
    return () => {
      // Don't clear active conversation here if we want to preserve state when going back?
      // But typically we should clear it if we leave the page.
      setActiveConversation(null)
    }
    // Only depend on conversationId, not on conversations or activeConversation
    // This prevents re-execution when conversations array updates
  }, [conversationId, setActiveConversation])


  // MutationObserver to detect DOM changes and auto-scroll
  // This ensures scroll stays at bottom when new messages are added to DOM
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const observer = new MutationObserver((mutations) => {
      // Only scroll if there were actual changes
      let hasChanges = false
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
          hasChanges = true
          break
        }
      }
      
      if (hasChanges) {
        // Always scroll to bottom when DOM changes (new messages added)
        // Multiple attempts to ensure it works
        const forceScroll = () => {
          if (messagesContainerRef.current) {
            const container = messagesContainerRef.current
            // Force scroll to absolute bottom
            container.scrollTop = container.scrollHeight
          }
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' })
          }
        }
        
        // Immediate scroll
        forceScroll()
        requestAnimationFrame(forceScroll)
        setTimeout(forceScroll, 0)
        setTimeout(forceScroll, 10)
        setTimeout(forceScroll, 50)
        setTimeout(forceScroll, 100)
        setTimeout(forceScroll, 200)
      }
    })

    // Observe changes to the messages container and its children
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Force initial scroll to bottom when container mounts (BEFORE paint)
  // This ensures the scroll starts at the bottom like a typewriter
  useLayoutEffect(() => {
    // Force scroll BEFORE paint to ensure it starts at bottom
    if (messagesContainerRef.current) {
      // Set scroll to bottom immediately - this runs before paint
      // Use a small timeout to ensure DOM is ready
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
      }, 0)
    }
  }, [conversationId])

  // Force scroll on mount - runs after first render
  useLayoutEffect(() => {
    const forceScroll = () => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      }
    }
    // Force immediately
    forceScroll()
    // And after a frame
    requestAnimationFrame(forceScroll)
  }, []) // Run once on mount

  // Also force scroll AFTER paint to catch any late DOM updates
  useEffect(() => {
    // Force scroll function
    const forceScroll = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current
        // Always scroll to absolute bottom
        container.scrollTop = container.scrollHeight
      }
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' })
      }
    }
    
    // Try immediately and repeatedly to ensure it works
    requestAnimationFrame(forceScroll)
    const timers = [0, 10, 50, 100, 200, 300, 500, 1000].map(delay => 
      setTimeout(forceScroll, delay)
    )
    
    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [conversationId]) // Run when conversation changes

  // Auto-scroll to bottom when messages change
  // Always scroll to the end when new messages arrive (user sent or received)
  // Works like a typewriter - always shows the latest message
  useEffect(() => {
    // Clear any pending scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Aggressive scrolling - multiple attempts to ensure it works
    // Like a typewriter - always scroll to show the latest
    // Force scroll immediately and repeatedly
    const forceScroll = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current
        // Always scroll to absolute bottom
        container.scrollTop = container.scrollHeight
      }
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' })
      }
    }

    // Multiple attempts with different timings
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
  }, [messages])

  // Scroll to bottom when messages finish loading
  useEffect(() => {
    if (!isLoadingMessages && messages.length > 0) {
      const forceScroll = () => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current
          container.scrollTop = container.scrollHeight
        }
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' })
        }
      }
      
      requestAnimationFrame(forceScroll)
      setTimeout(forceScroll, 0)
      setTimeout(forceScroll, 50)
      setTimeout(forceScroll, 150)
      setTimeout(forceScroll, 300)
      setTimeout(forceScroll, 500)
    }
  }, [isLoadingMessages, messages.length])

  const handleSend = async (text: string) => {
    if (text.trim()) {
      await sendMessage(text)
      // Force scroll immediately after sending (optimistic update)
      // Like a typewriter - always scroll to show the new message
      // Multiple attempts to ensure scroll happens
      const forceScroll = () => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current
          container.scrollTop = container.scrollHeight
        }
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' })
        }
      }
      
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
      <div className="lg:hidden fixed inset-0 flex flex-col bg-grain overflow-hidden z-20">
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
          className="flex-1 overflow-y-auto px-4 bg-grain min-h-0"
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div 
            className="py-4 flex-1 flex flex-col"
            style={{
              justifyContent: 'flex-end',
              minHeight: '100%',
            }}
          >
            {isLoadingMessages && messages.length === 0 ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center flex-1">
                <p className="text-dark-400 dark:text-dark-500 text-sm">
                  Nenhuma mensagem ainda. Comece a conversa!
                </p>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* Input Footer */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-dark-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:dark:bg-dark-950/80 border-t border-dark-200 dark:border-dark-800 pb-[env(safe-area-inset-bottom,0px)]">
          <ChatInput onSend={handleSend} />
        </div>
      </div>

      {/* Desktop View */}
      <main className="hidden lg:block container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-dark-900 rounded-lg border border-dark-200 dark:border-dark-800 flex flex-col h-[calc(100vh-12rem)]">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
              <button
                onClick={() => {
                  setActiveConversation(null)
                  navigate('/chat')
                }}
                className="p-2 -ml-2 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50 transition-colors rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800"
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
              className="flex-1 overflow-y-auto px-6 py-4 bg-dark-50/50 dark:bg-dark-950/50"
            >
              <div className="space-y-3 min-h-full flex flex-col">
                {isLoadingMessages && messages.length === 0 ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-dark-400 dark:text-dark-500 text-sm">
                      Nenhuma mensagem ainda. Comece a conversa!
                    </p>
                  </div>
                ) : (
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
                    <div className="h-2" />
                    <div ref={messagesEndRef} className="h-0" />
                  </>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-dark-200 dark:border-dark-800 flex-shrink-0 bg-white dark:bg-dark-900">
              <ChatInput onSend={handleSend} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
