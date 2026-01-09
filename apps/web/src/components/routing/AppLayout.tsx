import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardHeaderMobile } from '@/pages/dashboard/components/DashboardHeaderMobile'
import { FooterMobile } from '@/components/layout/FooterMobile'

interface AppLayoutProps {
  readonly children: ReactNode
}

import { ChatProvider } from '@/contexts/ChatContext'

// ... existing imports

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isChatPage = location.pathname.startsWith('/chat')

  const isChatConversation = location.pathname.startsWith('/chat/')
  const isChatList = isChatPage && !isChatConversation

  const handleNewConversation = () => {
    globalThis.dispatchEvent(new Event('toggleNewChatDropdown'))
  }

  return (
    <ChatProvider>
      {/* Fixed Navigation Elements - Outside animation to preserve fixed positioning */}
      <Sidebar />

      <div className="lg:hidden">
        <DashboardHeaderMobile
          onNotificationPress={() => {
            // Handle notifications
          }}
          onBack={isChatConversation ? () => navigate('/chat') : undefined}
          title={isChatConversation ? 'Chat' : undefined}
          showChurchSelector={!isChatPage}
          showNewConversationButton={isChatList}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Mobile Footer - Fixed for all mobile screens */}
      {!isChatConversation && (
        <div className="lg:hidden">
          <FooterMobile />
        </div>
      )}

      {/* Main Content - Animated Background & Page */}
      <div className="h-[100dvh] w-screen overflow-hidden bg-gray-50 dark:bg-dark-950 lg:bg-grain relative animate-fade-in supports-[height:100dvh]:h-[100dvh] h-screen">
        {/* Overlay only for grain effect on desktop */}
        <div className="hidden lg:block absolute inset-0 bg-white/40 dark:bg-dark-950/60 transition-colors duration-300" />
        <div className="relative z-10 h-full flex flex-col lg:block">
          {/* Desktop Layout Content */}
          <div className={`lg:ml-64 h-full relative flex flex-col`}>
            {/* Desktop Header - Only shown on desktop */}
            {!isChatPage && (
              <div className="hidden lg:block flex-shrink-0">
                <Header />
              </div>
            )}
            <main
              className={`flex-1 overflow-y-auto overscroll-y-contain animate-fade-in-up scroll-smooth ${
                isChatPage
                  ? 'p-0 pt-[env(safe-area-inset-top)] overflow-hidden'
                  : 'pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(6.5rem+env(safe-area-inset-bottom))] px-4 lg:pt-16 lg:pb-0 lg:px-8'
              }`}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </ChatProvider>
  )
}
