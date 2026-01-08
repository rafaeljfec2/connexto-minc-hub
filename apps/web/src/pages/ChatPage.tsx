import { ChatList } from './chat/components/ChatList'
import { ChatLayout } from './chat/components/ChatLayout'
import { useState } from 'react'
import { UserSelectionModal } from './chat/components/UserSelectionModal'
import { useChat } from '@/hooks/useChat'
import { useNavigate } from 'react-router-dom'

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
  const { startConversation, conversations } = useChat()
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)

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
          <EmptyState onStartNewChat={() => setIsNewChatModalOpen(true)} />
        </ChatLayout>
      </div>

      <UserSelectionModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectUser={handleSelectUser}
      />
    </>
  )
}
