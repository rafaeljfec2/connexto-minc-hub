import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { ConversationItem } from './ConversationItem'
import { UserSelectionModal } from './UserSelectionModal'
import { CreateGroupModal } from './CreateGroupModal'

interface ChatListProps {
  className?: string
  onConversationClick?: () => void
}

function ChatListLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

function ChatListEmpty({ onNewChat }: Readonly<{ onNewChat: () => void }>) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-dark-500 dark:text-dark-400 text-sm">Nenhuma conversa ainda</p>
      <button
        onClick={onNewChat}
        className="mt-4 text-primary-500 text-sm font-medium hover:underline"
      >
        Iniciar conversa
      </button>
    </div>
  )
}

export function ChatList({ className, onConversationClick }: Readonly<ChatListProps>) {
  const navigate = useNavigate()
  const location = useLocation()
  const { conversations, isLoadingConversations, startConversation, createGroup } = useChat()
  const { user } = useAuth()
  const { showError } = useToast()

  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrar conversas baseado no termo de busca
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations

    const term = searchTerm.toLowerCase()
    return conversations.filter(conversation => {
      const otherParticipant = conversation.participants.find(p => p.id !== user?.id)
      if (!otherParticipant) return false

      // Buscar pelo nome do participante
      if (otherParticipant.name?.toLowerCase().includes(term)) return true

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
      showError('Falha ao iniciar conversa. Tente novamente.')
    }
  }

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-800 pt-[calc(4.5rem+env(safe-area-inset-top))] lg:pt-0 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-dark-200 dark:border-dark-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50">Conversas</h2>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-dark-200 dark:border-dark-700 z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setIsNewChatModalOpen(true)
                      setIsDropdownOpen(false)
                    }}
                    className="w-full px-4 py-3 text-left text-dark-900 dark:text-dark-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors flex items-center gap-3"
                  >
                    <svg
                      className="w-5 h-5 text-dark-500 dark:text-dark-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">Nova Conversa</p>
                      <p className="text-xs text-dark-500 dark:text-dark-400">
                        Conversa individual
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setIsGroupChatModalOpen(true)
                      setIsDropdownOpen(false)
                    }}
                    className="w-full px-4 py-3 text-left text-dark-900 dark:text-dark-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors flex items-center gap-3 border-t border-dark-200 dark:border-dark-700"
                  >
                    <svg
                      className="w-5 h-5 text-dark-500 dark:text-dark-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">Nova Conversa em Grupo</p>
                      <p className="text-xs text-dark-500 dark:text-dark-400">
                        Conversa com múltiplas pessoas
                      </p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
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
          <ChatListLoading />
        ) : filteredConversations.length === 0 ? (
          <ChatListEmpty onNewChat={() => setIsNewChatModalOpen(true)} />
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

      <CreateGroupModal
        isOpen={isGroupChatModalOpen}
        onClose={() => setIsGroupChatModalOpen(false)}
        onCreateGroup={async (name, selectedUserIds) => {
          try {
            const newGroup = await createGroup(name, selectedUserIds)
            navigate(`/chat/${newGroup.id}`)
            onConversationClick?.()
            setIsGroupChatModalOpen(false)
          } catch (error) {
            console.error('Failed to create group', error)
            showError('Falha ao criar grupo.')
          }
        }}
      />
    </div>
  )
}
