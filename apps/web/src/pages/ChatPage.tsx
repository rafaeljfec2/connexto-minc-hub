import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConversationItem } from './chat/components/ConversationItem'
import { UserSelectionModal } from './chat/components/UserSelectionModal'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/contexts/AuthContext'

export default function ChatPage() {
  const navigate = useNavigate()
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
  }

  const handleMenuClick = () => {
    const menuButton = document.querySelector(
      '[aria-label="Abrir menu"], [aria-label="Fechar menu"]'
    ) as HTMLElement
    if (menuButton) {
      menuButton.click()
    }
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
    } catch (error) {
      console.error('Failed to start conversation', error)
    }
  }

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-primary-500/10 rounded-full blur-2xl" />
        <div className="relative bg-primary-100 dark:bg-primary-900/20 rounded-full p-6">
          <svg
            className="w-16 h-16 text-primary-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-dark-900 dark:text-dark-50 mb-2">
        Nenhuma conversa ainda
      </h3>
      <p className="text-dark-500 dark:text-dark-400 mb-8 max-w-sm mx-auto">
        Sua caixa de entrada está vazia. Comece uma nova conversa com alguém da equipe!
      </p>
      <button
        onClick={() => setIsNewChatModalOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 active:bg-primary-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Iniciar nova conversa
      </button>
    </div>
  )

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-900/30 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-sm text-dark-500 dark:text-dark-400">Carregando conversas...</p>
    </div>
  )

  const renderConversationsList = () => {
    if (!filteredConversations.length) {
      if (searchTerm.trim()) {
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-dark-500 dark:text-dark-400">Nenhuma conversa encontrada</p>
          </div>
        )
      }
      return null
    }

    return (
      <div>
        {filteredConversations.map((conversation, index) => {
          const otherParticipant = conversation.participants.find(p => p.id !== user?.id)
          if (!otherParticipant) return null
          return (
            <div
              key={conversation.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
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
    )
  }

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden fixed inset-0 flex flex-col bg-white dark:bg-dark-950 overflow-hidden z-10">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-950 safe-area-top pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={handleMenuClick}
                className="p-2 -ml-2 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                aria-label="Abrir menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-dark-900 dark:text-dark-50">Chat</h1>
            </div>

            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="p-2 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50 transition-colors"
              aria-label="Nova conversa"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-dark-400 dark:text-dark-500"
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
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar conversa..."
                className="w-full pl-10 pr-4 py-2.5 bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-lg text-sm text-dark-900 dark:text-dark-50 placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 bg-white dark:bg-dark-950">
          {(() => {
            if (isLoadingConversations && conversations.length === 0) {
              return renderLoadingState()
            }
            if (conversations.length === 0 && !searchTerm.trim()) {
              return renderEmptyState()
            }
            return renderConversationsList()
          })()}
        </main>
      </div>

      {/* Desktop View */}
      <main className="hidden lg:block container mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)]">
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <PageHeader title="Chat" description="Comunicação com sua equipe" />
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nova Conversa
            </button>
          </div>

          <div className="bg-white dark:bg-dark-900 rounded-xl border border-dark-200 dark:border-dark-800 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {(() => {
                if (isLoadingConversations && conversations.length === 0) {
                  return renderLoadingState()
                }
                if (conversations.length === 0) {
                  return renderEmptyState()
                }
                return renderConversationsList()
              })()}
            </div>
          </div>
        </div>
      </main>

      {/* User Selection Modal */}
      {isNewChatModalOpen && (
        <UserSelectionModal
          isOpen={isNewChatModalOpen}
          onClose={() => setIsNewChatModalOpen(false)}
          onSelectUser={handleSelectUser}
        />
      )}
    </>
  )
}
