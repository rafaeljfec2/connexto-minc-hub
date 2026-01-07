import type { Conversation } from '@minc-hub/shared'

interface ConversationItemProps {
  readonly conversation: Conversation
  readonly onPress: (conversationId: string, otherUserId: string) => void
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const otherParticipant = conversation.participants.find(p => p.id !== 'me')

  if (!otherParticipant) return null

  const lastMessageTime = conversation.lastMessage
    ? new Date(conversation.lastMessage.createdAt)
    : new Date(conversation.updatedAt)
  const timeString = isToday(lastMessageTime)
    ? lastMessageTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : lastMessageTime.toLocaleDateString('pt-BR')

  const handleClick = () => {
    onPress(conversation.id, otherParticipant.id)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center gap-4 p-4 border-b border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors text-left"
    >
      <div className="relative flex-shrink-0">
        <img
          src={
            otherParticipant.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.name)}`
          }
          alt={otherParticipant.name}
          className="w-12 h-12 rounded-full bg-dark-200 dark:bg-dark-800"
        />
        {otherParticipant.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-900" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-dark-900 dark:text-dark-50 truncate">
            {otherParticipant.name}
          </span>
          <span className="text-xs text-dark-500 dark:text-dark-400 flex-shrink-0 ml-2">
            {timeString}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-dark-600 dark:text-dark-400 truncate flex-1">
            {conversation.lastMessage?.senderId === 'me' && (
              <span className="text-dark-500 dark:text-dark-500">Você: </span>
            )}
            {conversation.lastMessage?.text || 'Nova conversa'}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-primary-500 text-white text-[10px] font-bold min-w-[20px] text-center">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
