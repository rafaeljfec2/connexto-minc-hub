import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConversationItem } from './chat/components/ConversationItem'
import { UserSelectionModal } from './chat/components/UserSelectionModal'
import { useChat } from '@/contexts/ChatContext'
import { useAuth } from '@/contexts/AuthContext'

export default function ChatPage() {
  const navigate = useNavigate()
  const { conversations, isLoadingConversations, startConversation } = useChat()
  const { user } = useAuth()
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)

  function handleConversationPress(conversationId: string, otherUserId: string) {
    navigate(`/chat/${conversationId}`, { state: { otherUserId } })
  }

  const handleMenuClick = () => {
    // Trigger the mobile menu button click from Sidebar (shared logic)
    const menuButton = document.querySelector(
      '[aria-label="Abrir menu"], [aria-label="Fechar menu"]'
    ) as HTMLElement
    if (menuButton) {
      menuButton.click()
    }
  }

  const handleSelectUser = async (userId: string) => {
    try {
      // Check if conversation already exists
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
      // Ideally show toast here
    }
  }

  const renderContent = () => {
    if (isLoadingConversations && conversations.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )
    }

    if (conversations.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
          <div className="mb-6">
            <svg
              className="w-24 h-24 text-dark-300 dark:text-dark-700 mx-auto opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-dark-500 dark:text-dark-400 text-lg mb-6 max-w-xs mx-auto">
            Sua caixa de entrada está vazia. Comece uma nova conversa com alguém da equipe!
          </p>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium shadow-md w-full max-w-xs"
          >
            Iniciar nova conversa
          </button>
        </div>
      )
    }

    return (
      <div className="divide-y divide-dark-100 dark:divide-dark-800">
        {conversations.map(conversation => {
          const otherParticipant = conversation.participants.find(p => p.id !== user?.id)
          if (!otherParticipant) return null
          return (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              onPress={handleConversationPress}
              currentUserId={user?.id}
            />
          )
        })}
      </div>
    )
  }

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden flex flex-col min-h-screen bg-white dark:bg-dark-950">
        {/* Custom Header with Glass Effect */}
        <div className="fixed top-0 left-0 right-0 z-30 w-full border-b border-dark-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-dark-800 dark:bg-dark-950/95 dark:supports-[backdrop-filter]:dark:bg-dark-950/80 transition-all duration-300 safe-area-top pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleMenuClick}
                className="p-2 -ml-2 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50 transition-colors"
                aria-label="Abrir menu"
              >
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="p-2 rounded-xl text-primary-500 hover:bg-primary-50 dark:hover:bg-dark-800 transition-colors"
              aria-label="Nova conversa"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content with padding for header - header: safe-area + py-3 (0.75rem top) + h-7 (1.75rem) + py-3 (0.75rem bottom) = 3.25rem */}
        <div className="flex-1 overflow-y-auto pb-20 pt-[calc(3.25rem+env(safe-area-inset-top))]">
          <div className="-mt-1">{renderContent()}</div>
        </div>
      </div>

      {/* Desktop View (Unchanged) */}
      <main className="hidden lg:block container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <PageHeader title="Chat" description="Comunicação com sua equipe" />
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-sm"
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

        <div className="bg-white dark:bg-dark-900 rounded-lg border border-dark-200 dark:border-dark-800 min-h-[400px] flex flex-col">
          {renderContent()}
        </div>
      </main>

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
