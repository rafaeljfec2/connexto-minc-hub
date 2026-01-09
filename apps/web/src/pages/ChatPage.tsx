import { ChatList } from './chat/components/ChatList'
import { ChatLayout } from './chat/components/ChatLayout'
import { useState, useEffect } from 'react'
import { UserSelectionModal } from './chat/components/UserSelectionModal'
import { NewConversationDropdown } from './chat/components/NewConversationDropdown'
import { useChat } from '@/hooks/useChat'
import { useNavigate, useLocation } from 'react-router-dom'

const EmptyState = ({ onStartNewChat }: { onStartNewChat: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50 dark:bg-dark-950">
    <div className="mb-6 relative">
      <div className="absolute inset-0 bg-primary-500/10 rounded-full blur-2xl" />
      <div className="relative bg-white dark:bg-dark-900 rounded-full p-6 shadow-lg">
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
    <h3 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-2">
      Minha Igreja na Cidade
    </h3>
    <p className="text-dark-500 dark:text-dark-400 mb-8 max-w-sm mx-auto">
      Envie e receba mensagens da sua equipe de forma simples e rápida.
    </p>
    <button
      onClick={onStartNewChat}
      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all shadow-lg hover:shadow-primary-600/30"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Nova Conversa
    </button>
  </div>
)

export default function ChatPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { startConversation, conversations } = useChat()
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Listen to dropdown state from AppLayout via custom event
  useEffect(() => {
    const handleDropdownToggle = () => {
      setIsDropdownOpen(prev => !prev)
    }

    window.addEventListener('toggleNewChatDropdown', handleDropdownToggle)
    return () => window.removeEventListener('toggleNewChatDropdown', handleDropdownToggle)
  }, [])

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

  return (
    <>
      <div className="lg:hidden h-full">
        <ChatList />
      </div>

      <div className="hidden lg:block h-full">
        <ChatLayout>
          <EmptyState onStartNewChat={() => setIsDropdownOpen(true)} />
        </ChatLayout>
      </div>

      <NewConversationDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onNewChat={() => setIsNewChatModalOpen(true)}
        onNewGroupChat={() => setIsGroupChatModalOpen(true)}
      />

      <UserSelectionModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectUser={handleSelectUser}
      />

      {/* Group Chat Modal - Placeholder */}
      {isGroupChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-primary-600 dark:text-primary-400"
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
              </div>
              <h3 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-2">Em Breve!</h3>
              <p className="text-dark-600 dark:text-dark-400 mb-6">
                A funcionalidade de conversas em grupo está em desenvolvimento e estará disponível
                em breve.
              </p>
              <button
                onClick={() => setIsGroupChatModalOpen(false)}
                className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
