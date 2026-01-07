interface ChatBubbleProps {
  readonly message: string
  readonly isMe: boolean
  readonly timestamp: string
}

export function ChatBubble({ message, isMe, timestamp }: ChatBubbleProps) {
  // Robust UTC parsing
  let dateStr = timestamp
  if (typeof timestamp === 'string') {
    // If it has no offset and no Z, append Z
    if (!timestamp.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(timestamp)) {
      dateStr = `${timestamp}Z`
    }
  }

  const date = new Date(dateStr)
  const isValidDate = !Number.isNaN(date.getTime())

  const time = isValidDate
    ? new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
      }).format(date)
    : '--:--'

  return (
    <div
      className={`mb-3 max-w-[80%] px-4 py-2 rounded-2xl ${
        isMe
          ? 'ml-auto bg-primary-500 text-white rounded-br-sm'
          : 'mr-auto bg-dark-200 dark:bg-dark-800 text-dark-900 dark:text-dark-50 rounded-bl-sm'
      }`}
    >
      <p className="text-sm leading-relaxed mb-1 break-words whitespace-pre-wrap">{message}</p>
      <div className="flex justify-end">
        <span
          className={`text-[10px] ${isMe ? 'text-white/70' : 'text-dark-500 dark:text-dark-400'}`}
        >
          {time}
        </span>
      </div>
    </div>
  )
}
