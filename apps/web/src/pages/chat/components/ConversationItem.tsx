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

  // Verificar se é da semana atual (últimos 7 dias)
  const today = new Date()
  const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff <= 7) {
    // Retornar dia da semana
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return weekdays[date.getDay()]
  }

  // Mais de uma semana: retornar data formatada
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
      className={`w-full flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-gray-800 transition-all duration-200 text-left group
        ${hasUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {otherParticipant.avatar ? (
          <img
            src={otherParticipant.avatar}
            alt={otherParticipant.name}
            className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-transparent group-hover:ring-gray-100 dark:group-hover:ring-gray-800 transition-all"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {otherParticipant.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
        )}
        {otherParticipant.isOnline && (
          <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-950 shadow-sm" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span
            className={`text-sm truncate ${hasUnread ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-gray-200'}`}
          >
            {otherParticipant.name}
          </span>
          <span
            className={`text-xs flex-shrink-0 ${hasUnread ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
          >
            {timeString}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm truncate flex-1 text-gray-500 dark:text-gray-400">
            {isFromCurrentUser && (
              <span className="text-gray-400 dark:text-gray-500 mr-1">Você:</span>
            )}
            <span className={hasUnread ? 'font-medium text-gray-700 dark:text-gray-300' : ''}>
              {conversation.lastMessage?.text || (
                <span className="italic text-gray-400">Nova conversa</span>
              )}
            </span>
          </p>
          {hasUnread && (
            <span className="flex-shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
