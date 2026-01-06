import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ChatBubble } from './chat/components/ChatBubble'
import { ChatInput } from './chat/components/ChatInput'
import { MOCK_MESSAGES, MOCK_USERS, type Message } from './chat/constants/mockChatData'

export default function ChatDetailPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const otherUserId = (location.state as { otherUserId?: string })?.otherUserId ?? ''
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const otherUser = otherUserId ? MOCK_USERS[otherUserId] : null
  const [messages, setMessages] = useState<Message[]>(
    conversationId ? MOCK_MESSAGES[conversationId] ?? [] : []
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend(text: string) {
    const newMessage: Message = {
      id: Math.random().toString(),
      text,
      senderId: 'me',
      timestamp: new Date().toISOString(),
      read: false,
    }
    setMessages(prev => [...prev, newMessage])
  }

  if (!otherUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-dark-400 dark:text-dark-500">Conversa não encontrada</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden flex flex-col min-h-screen bg-grain">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-[100] bg-white/95 dark:bg-dark-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:dark:bg-dark-950/80 border-b border-dark-200 dark:border-dark-800 safe-area-top">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => navigate('/chat')}
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
                src={otherUser.avatar}
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
              {otherUser.isOnline && (
                <p className="text-xs text-green-500">Online</p>
              )}
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pt-[calc(4.5rem+env(safe-area-inset-top,0px))] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] px-4 bg-grain">
          <div className="py-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-dark-400 dark:text-dark-500 text-sm">
                  Nenhuma mensagem ainda. Comece a conversa!
                </p>
              </div>
            ) : (
              messages.map(message => (
                <ChatBubble
                  key={message.id}
                  message={message.text}
                  isMe={message.senderId === 'me'}
                  timestamp={message.timestamp}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-dark-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:dark:bg-dark-950/80 border-t border-dark-200 dark:border-dark-800 pb-[env(safe-area-inset-bottom,0px)]">
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
                onClick={() => navigate('/chat')}
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
                  src={otherUser.avatar}
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
                {otherUser.isOnline && (
                  <p className="text-xs text-green-500">Online</p>
                )}
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
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-dark-50/50 dark:bg-dark-950/50">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-dark-400 dark:text-dark-500 text-sm">
                      Nenhuma mensagem ainda. Comece a conversa!
                    </p>
                  </div>
                ) : (
                  messages.map(message => (
                    <ChatBubble
                      key={message.id}
                      message={message.text}
                      isMe={message.senderId === 'me'}
                      timestamp={message.timestamp}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
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
