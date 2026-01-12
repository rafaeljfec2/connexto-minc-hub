import { useNavigate } from 'react-router-dom'

interface ChatListHeaderProps {
  readonly onNewConversationClick: () => void
}

export function ChatListHeader({ onNewConversationClick }: ChatListHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50 transition-colors lg:hidden"
          aria-label="Voltar"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50">Conversas</h2>
      </div>
      <button
        onClick={onNewConversationClick}
        className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        title="Nova conversa"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}
