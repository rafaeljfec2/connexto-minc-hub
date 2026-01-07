import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'
import { ChatWindow } from './ChatWindow'
import { cn } from '@/lib/utils'

export function ChatFloatingButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { unreadCount } = useChat()

  return (
    <>
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-50 p-3.5 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95',
          isOpen
            ? 'bg-gray-200 dark:bg-dark-700 text-gray-600 dark:text-gray-300 transform rotate-90'
            : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-600/30'
        )}
        aria-label="Abrir chat"
      >
        <MessageCircle size={24} />

        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-dark-950 animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </>
  )
}
