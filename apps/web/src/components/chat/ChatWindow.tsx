import React, { useState, useEffect, useRef } from 'react'
import { Send, X, MessageSquare, ChevronLeft } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Conversation } from '@minc-hub/shared'

interface ChatWindowProps {
  onClose: () => void
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    isLoadingMessages,
  } = useChat()
  const { user } = useAuth()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, activeConversation])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim()) return

    await sendMessage(inputValue)
    setInputValue('')
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation)
  }

  const handleBack = () => {
    setActiveConversation(null)
  }

  // Helper to get other participant name
  const getParticipantName = (conversation: Conversation) => {
    const other = conversation.participants.find(p => p.id !== user?.id)
    return other?.name || 'Unknown User'
  }

  return (
    <div className="fixed bottom-20 right-4 w-[90vw] md:w-96 h-[500px] bg-white dark:bg-dark-900 rounded-lg shadow-xl border border-gray-200 dark:border-dark-800 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-dark-800 flex items-center justify-between bg-primary-600 text-white">
        <div className="flex items-center gap-2">
          {activeConversation ? (
            <button onClick={handleBack} className="p-1 hover:bg-primary-700 rounded-full mr-1">
              <ChevronLeft size={20} />
            </button>
          ) : (
            <MessageSquare size={20} />
          )}
          <h3 className="font-semibold text-lg">
            {activeConversation ? getParticipantName(activeConversation) : 'Mensagens'}
          </h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-primary-700 rounded-full">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-950">
        {activeConversation ? (
          // Messages View
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {isLoadingMessages && messages.length === 0 && (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.senderId === user?.id
                return (
                  <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg p-3 text-sm',
                        isMe
                          ? 'bg-primary-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-dark-800 text-gray-800 dark:text-gray-100 shadow-sm rounded-bl-none'
                      )}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={cn(
                          'text-[10px] block text-right mt-1 opacity-70',
                          isMe ? 'text-white' : 'text-gray-500'
                        )}
                      >
                        {format(new Date(msg.createdAt), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-dark-900 border-t border-gray-100 dark:border-dark-800">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 rounded-full px-4 py-2 bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          // Conversation List
          <div className="divide-y divide-gray-100 dark:divide-dark-800">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Nenhuma conversa encontrada.</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className="w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-semibold uppercase">
                    {getParticipantName(conv).substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {getParticipantName(conv)}
                      </span>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(conv.lastMessage.createdAt), 'HH:mm')}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate pr-2">
                        {conv.lastMessage?.text || 'Nova conversa'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
