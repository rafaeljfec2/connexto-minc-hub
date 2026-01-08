import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/contexts/AuthContext'
import { ConversationItem } from './ConversationItem'
import { UserSelectionModal } from './UserSelectionModal'

interface ChatListProps {
  className?: string
  onConversationClick?: () => void
}

export function ChatList({ className, onConversationClick }: ChatListProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { conversations, isLoadingConversations, startConversation } = useChat()
  const { user } = useAuth()
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrar conversas baseado no termo de busca
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations

    const term = searchTerm.toLowerCase()
    return conversations.filter(conversation => {
      const otherParticipant = conversation.participants.find(p => p.id !== user?.id)
      if (!otherParticipant) return false

      // Buscar pelo nome do participante
      if (otherParticipant.name.toLowerCase().includes(term)) return true

      // Buscar pelo texto da última mensagem
      if (conversation.lastMessage?.text.toLowerCase().includes(term)) return true

      return false
    })
  }, [conversations, searchTerm, user?.id])

  function handleConversationPress(conversationId: string, otherUserId: string) {
    navigate(`/chat/${conversationId}`, { state: { otherUserId } })
    onConversationClick?.()
  }

  const handleSelectUser = async (userId: string) => {
    try {
      const existingConversation = conversations.find(c =>
        c.participants.some(p => p.id === userId)
      )

      if (existingConversation) {
        navigate(`/chat/${existingConversation.id}`, { state: { otherUserId: userId } })
      } else {
        const newConversation = await startConversation(userId)
        navigate(`/chat/${newConversation.id}`, { state: { otherUserId: userId } })
      }
      setIsNewChatModalOpen(false)
      onConversationClick?.()
    } catch (error) {
      console.error('Failed to start conversation', error)
    }
  }

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-dark-500 dark:text-dark-400 text-sm">Nenhuma conversa ainda</p>
      <button
        onClick={() => setIsNewChatModalOpen(true)}
        className="mt-4 text-primary-500 text-sm font-medium hover:underline"
      >
        Iniciar conversa
      </button>
    </div>
  )

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-800 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-dark-200 dark:border-dark-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50">Conversas</h2>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="Nova conversa"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-dark-50 dark:bg-dark-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary-500"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-dark-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingConversations ? (
          renderLoadingState()
        ) : filteredConversations.length === 0 ? (
          renderEmptyState()
        ) : (
          <div>
            {filteredConversations.map(conversation => {
              const isActive = location.pathname === `/chat/${conversation.id}`
              return (
                <div
                  key={conversation.id}
                  className={isActive ? 'bg-primary-50 dark:bg-primary-900/10' : ''}
                >
                  <ConversationItem
                    conversation={conversation}
                    onPress={handleConversationPress}
                    currentUserId={user?.id}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <UserSelectionModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectUser={handleSelectUser}
      />
    </div>
  )
}
