import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConversationItem } from './chat/components/ConversationItem'
import { MOCK_CONVERSATIONS } from './chat/constants/mockChatData'

export default function ChatPage() {
  const navigate = useNavigate()
  const [conversations] = useState(MOCK_CONVERSATIONS)

  function handleConversationPress(conversationId: string, otherUserId: string) {
    navigate(`/chat/${conversationId}`, { state: { otherUserId } })
  }

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto pb-20 pt-4">
          <div className="px-4 mb-4">
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-1">Chat</h1>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Comunicação com sua equipe
            </p>
          </div>

          <div className="bg-white dark:bg-dark-900">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-dark-400 dark:text-dark-500">Nenhuma conversa</p>
              </div>
            ) : (
              conversations.map(conversation => {
                const otherParticipant = conversation.participants.find(p => p.id !== 'me')
                if (!otherParticipant) return null
                return (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    onPress={handleConversationPress}
                  />
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <main className="hidden lg:block container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Chat"
          description="Comunicação com sua equipe"
        />
        <div className="bg-white dark:bg-dark-900 rounded-lg border border-dark-200 dark:border-dark-800">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-dark-400 dark:text-dark-500">Nenhuma conversa</p>
            </div>
          ) : (
            conversations.map(conversation => {
              const otherParticipant = conversation.participants.find(p => p.id !== 'me')
              if (!otherParticipant) return null
              return (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  onPress={handleConversationPress}
                />
              )
            })
          )}
        </div>
      </main>
    </>
  )
}
