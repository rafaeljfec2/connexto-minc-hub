type MessageStatus = 'sending' | 'sent' | 'read'

interface ChatBubbleProps {
  readonly message: string
  readonly isMe: boolean
  readonly timestamp: string
  readonly status?: MessageStatus
}

export function ChatBubble({ message, isMe, timestamp, status }: ChatBubbleProps) {
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
      <div className="flex justify-end items-center gap-1">
        <span
          className={`text-[10px] ${isMe ? 'text-white/70' : 'text-dark-500 dark:text-dark-400'}`}
        >
          {time}
        </span>

        {isMe && status && (
          <span className="flex items-center gap-0.5 text-[10px]">
            {status === 'sending' && (
              <svg
                className="h-3 w-3 text-white/70 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" className="opacity-20" />
                <path d="M12 2a10 10 0 0 1 10 10" className="opacity-90" />
              </svg>
            )}

            {status === 'sent' && (
              <svg className="h-3 w-3 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="m5 13 3.5 3.5L19 6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}

            {status === 'read' && (
              <svg className="h-3.5 w-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="m4.5 13.5 3.75 3.75L19.5 6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="m10 13.5 3.75 3.75L22 8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        )}
      </div>
    </div>
  )
}
