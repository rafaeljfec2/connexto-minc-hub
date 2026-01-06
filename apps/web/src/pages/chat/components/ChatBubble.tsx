interface ChatBubbleProps {
  readonly message: string
  readonly isMe: boolean
  readonly timestamp: string
}

export function ChatBubble({ message, isMe, timestamp }: ChatBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className={`mb-3 max-w-[80%] px-4 py-2 rounded-2xl ${
        isMe
          ? 'ml-auto bg-primary-500 text-white rounded-br-sm'
          : 'mr-auto bg-dark-200 dark:bg-dark-800 text-dark-900 dark:text-dark-50 rounded-bl-sm'
      }`}
    >
      <p className="text-sm leading-relaxed mb-1">{message}</p>
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
