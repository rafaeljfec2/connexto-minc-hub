import type { Conversation } from '@minc-hub/shared'

interface ConversationItemProps {
  readonly conversation: Conversation
  readonly onPress: (conversationId: string, otherUserId: string) => void
  readonly currentUserId?: string
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function formatTime(date: Date): string {
  if (isToday(date)) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Ontem'
  }

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function ConversationItem({ conversation, onPress, currentUserId }: ConversationItemProps) {
  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId)

  if (!otherParticipant) return null

  const lastMessageTime = conversation.lastMessage
    ? new Date(conversation.lastMessage.createdAt)
    : new Date(conversation.updatedAt)
  const timeString = formatTime(lastMessageTime)

  const handleClick = () => {
    onPress(conversation.id, otherParticipant.id)
  }

  const hasUnread = conversation.unreadCount > 0
  const isFromCurrentUser = conversation.lastMessage?.senderId === currentUserId

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-4 py-3 border-b border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800/50 active:bg-dark-100 dark:active:bg-dark-800 transition-colors duration-200 text-left group"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white dark:ring-dark-900 group-hover:ring-primary-200 dark:group-hover:ring-primary-800 transition-all duration-200">
          {otherParticipant.avatar ? (
            <img
              src={otherParticipant.avatar}
              alt={otherParticipant.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>{otherParticipant.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        {otherParticipant.isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-dark-900 ring-1 ring-green-500/20" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <span
            className={`text-sm font-semibold truncate ${
              hasUnread
                ? 'text-dark-900 dark:text-dark-50'
                : 'text-dark-700 dark:text-dark-300'
            }`}
          >
            {otherParticipant.name}
          </span>
          <span
            className={`text-xs flex-shrink-0 ${
              hasUnread
                ? 'text-primary-600 dark:text-primary-400 font-medium'
                : 'text-dark-400 dark:text-dark-500'
            }`}
          >
            {timeString}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-sm truncate flex-1 ${
              hasUnread
                ? 'text-dark-900 dark:text-dark-50 font-medium'
                : 'text-dark-500 dark:text-dark-400'
            }`}
          >
            {isFromCurrentUser && (
              <span className="text-dark-400 dark:text-dark-500 mr-1">Você: </span>
            )}
            {conversation.lastMessage?.text || (
              <span className="italic text-dark-400 dark:text-dark-500">Nova conversa</span>
            )}
          </p>
          {hasUnread && (
            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-primary-500 text-white text-xs font-bold min-w-[20px] text-center shadow-sm">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Hover indicator */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
        <svg
          className="w-5 h-5 text-dark-400 dark:text-dark-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  )
}
