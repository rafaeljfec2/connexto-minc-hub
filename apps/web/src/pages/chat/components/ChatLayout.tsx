import { ReactNode } from 'react'
import { ChatList } from './ChatList'

interface ChatLayoutProps {
  children: ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-dark-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 lg:w-96 h-full border-r border-dark-200 dark:border-dark-800 flex-shrink-0">
        <ChatList className="h-full" />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-full relative">{children}</main>
    </div>
  )
}
