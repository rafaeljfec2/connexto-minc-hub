interface ChatListDropdownProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onNewChat: () => void
  readonly onNewGroupChat: () => void
}

export function ChatListDropdown({
  isOpen,
  onClose,
  onNewChat,
  onNewGroupChat,
}: ChatListDropdownProps) {
  if (!isOpen) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-10 cursor-default"
        onClick={onClose}
        onKeyDown={e => {
          if (e.key === 'Escape' || e.key === 'Enter') {
            onClose()
          }
        }}
        aria-label="Fechar menu"
      />
      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-dark-200 dark:border-dark-700 z-50 overflow-hidden">
        <button
          onClick={() => {
            onNewChat()
            onClose()
          }}
          className="w-full px-4 py-3 text-left text-dark-900 dark:text-dark-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors flex items-center gap-3"
        >
          <svg
            className="w-5 h-5 text-dark-500 dark:text-dark-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <div>
            <p className="font-medium">Nova Conversa</p>
            <p className="text-xs text-dark-500 dark:text-dark-400">Conversa individual</p>
          </div>
        </button>
        <button
          onClick={() => {
            onNewGroupChat()
            onClose()
          }}
          className="w-full px-4 py-3 text-left text-dark-900 dark:text-dark-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors flex items-center gap-3 border-t border-dark-200 dark:border-dark-700"
        >
          <svg
            className="w-5 h-5 text-dark-500 dark:text-dark-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <div>
            <p className="font-medium">Nova Conversa em Grupo</p>
            <p className="text-xs text-dark-500 dark:text-dark-400">
              Conversa com múltiplas pessoas
            </p>
          </div>
        </button>
      </div>
    </>
  )
}
