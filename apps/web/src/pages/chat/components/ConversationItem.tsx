import type { Conversation } from '@minc-hub/shared'
import { Avatar } from '@/components/ui/Avatar'

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
  // Determine display info based on whether it's a group or private chat
  const isGroup = conversation.type === 'group'

  let displayName = ''
  let displayAvatar = null
  let otherParticipantId = ''
  let isOnline = false

  if (isGroup) {
    displayName = conversation.name || 'Grupo Sem Nome'
    // For now, no specific group avatar, can add logic later or use a generic icon
    // displayAvatar = conversation.avatar
    otherParticipantId = 'group' // Identifier to know it's a group click
  } else {
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId)
    if (!otherParticipant) return null

    displayName = otherParticipant.name || 'Usuário'
    displayAvatar = otherParticipant.avatar
    otherParticipantId = otherParticipant.id
    isOnline = otherParticipant.isOnline || false
  }

  const lastMessageTime = conversation.lastMessage
    ? new Date(conversation.lastMessage.createdAt)
    : new Date(conversation.updatedAt)
  const timeString = formatTime(lastMessageTime)

  const handleClick = () => {
    onPress(conversation.id, otherParticipantId)
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
      {isGroup ? (
        <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 ring-2 ring-transparent group-hover:ring-gray-100 dark:group-hover:ring-gray-800 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
      ) : (
        <Avatar
          src={displayAvatar}
          name={displayName}
          isOnline={isOnline}
          size="lg"
          className="ring-2 ring-transparent group-hover:ring-gray-100 dark:group-hover:ring-gray-800 transition-all rounded-full"
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span
            className={`text-sm truncate ${hasUnread ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-gray-200'}`}
          >
            {displayName}
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
            {/* If group, it might be nice to show sender name if not from current user */}
            {isGroup && !isFromCurrentUser && conversation.lastMessage?.sender && (
              <span className="text-gray-400 dark:text-gray-500 mr-1">
                {conversation.lastMessage.sender?.name?.split(' ')[0]}:
              </span>
            )}
            <span className={hasUnread ? 'font-medium text-gray-700 dark:text-gray-300' : ''}>
              {conversation.lastMessage?.text || (
                <span className="italic text-gray-400">
                  {isGroup ? 'Grupo criado' : 'Nova conversa'}
                </span>
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
