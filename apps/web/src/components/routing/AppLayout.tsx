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
      <div
        className={`${isChatPage ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-grain relative animate-fade-in overflow-x-hidden`}
      >
        <div className="absolute inset-0 bg-white/40 dark:bg-dark-950/60 transition-colors duration-300" />
        <div className={`relative z-10 ${isChatPage ? 'h-full overflow-hidden' : ''}`}>
          <Sidebar />

          {/* Mobile Header - Fixed for all mobile screens, except chat pages */}
          {!isChatPage && (
            <div className="lg:hidden">
              <DashboardHeaderMobile
                onNotificationPress={() => {
                  // Handle notifications
                }}
              />
            </div>
          )}

          {/* Mobile Footer - Fixed for all mobile screens, except chat detail pages */}
          {!/^\/chat\/[^/]+$/.test(location.pathname) && (
            <div className="lg:hidden">
              <FooterMobile />
            </div>
          )}

          {/* Desktop Layout */}
          <div className={`lg:ml-64 relative ${isChatPage ? 'h-screen overflow-hidden' : ''}`}>
            {/* Desktop Header - Only shown on desktop */}
            {!isChatPage && (
              <div className="hidden lg:block">
                <Header />
              </div>
            )}
            <main
              className={`animate-fade-in-up ${
                location.pathname.startsWith('/chat/')
                  ? 'p-0 h-full overflow-hidden'
                  : 'min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)] pt-[calc(4.5rem+env(safe-area-inset-top,0px))] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pt-0 lg:pb-0'
              }`}
            >
              {children}
            </main>
          </div>

          {/* Chat Button Removed - Moved to Footer */}
        </div>
      </div>
    </ChatProvider>
  )
}
