import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
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
  const isChatPage = location.pathname.startsWith('/chat')

  return (
    <ChatProvider>
      {/* Fixed Navigation Elements - Outside animation to preserve fixed positioning */}
      <Sidebar />

      {!isChatPage && (
        <div className="lg:hidden">
          <DashboardHeaderMobile
            onNotificationPress={() => {
              // Handle notifications
            }}
          />
        </div>
      )}

      {/* Mobile Footer - Fixed for all mobile screens */}
      <div className="lg:hidden">
        <FooterMobile />
      </div>

      {/* Main Content - Animated Background & Page */}
      <div className="h-screen w-screen overflow-hidden bg-gray-50 dark:bg-dark-950 lg:bg-grain relative animate-fade-in">
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
                  ? 'p-0 overflow-hidden'
                  : 'pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))] px-4 lg:pt-0 lg:pb-0 lg:px-8'
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
