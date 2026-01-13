import { useLocation } from 'react-router-dom'
import type { Conversation } from '@minc-hub/shared'
import { ConversationItem } from './ConversationItem'

interface ChatListContentProps {
  readonly conversations: Conversation[]
  readonly isLoading: boolean
  readonly currentUserId?: string
  readonly onConversationPress: (conversationId: string, otherUserId: string) => void
  readonly onNewChat: () => void
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

export function ChatListContent({
  conversations,
  isLoading,
  currentUserId,
  onConversationPress,
  onNewChat,
}: ChatListContentProps) {
  const location = useLocation()

  if (isLoading) {
    return <ChatListLoading />
  }

  if (conversations.length === 0) {
    return <ChatListEmpty onNewChat={onNewChat} />
  }

  return (
    <div>
      {conversations.map(conversation => {
        const isActive = location.pathname === `/chat/${conversation.id}`
        return (
          <div
            key={conversation.id}
            className={isActive ? 'bg-primary-50 dark:bg-primary-900/10' : ''}
          >
            <ConversationItem
              conversation={conversation}
              onPress={onConversationPress}
              currentUserId={currentUserId}
            />
          </div>
        )
      })}
    </div>
  )
}
