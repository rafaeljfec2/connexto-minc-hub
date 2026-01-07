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
      className="w-full flex items-center gap-3 px-4 py-3 border-b border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800/50 active:bg-dark-100 dark:active:bg-dark-800 transition-colors text-left"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {otherParticipant.avatar ? (
          <img
            src={otherParticipant.avatar}
            alt={otherParticipant.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
            {otherParticipant.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
        )}
        {otherParticipant.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-900" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <span className="text-sm font-semibold text-dark-900 dark:text-dark-50 truncate">
            {otherParticipant.name}
          </span>
          <span className="text-xs text-dark-400 dark:text-dark-500 flex-shrink-0">
            {timeString}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-dark-500 dark:text-dark-400 truncate flex-1">
            {isFromCurrentUser && (
              <span className="text-dark-400 dark:text-dark-500 mr-1">Você: </span>
            )}
            {conversation.lastMessage?.text || (
              <span className="italic">Nova conversa</span>
            )}
          </p>
          {hasUnread && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
