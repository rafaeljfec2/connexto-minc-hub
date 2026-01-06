import type { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardHeaderMobile } from '@/pages/dashboard/components/DashboardHeaderMobile'

interface AppLayoutProps {
  readonly children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-grain relative animate-fade-in overflow-x-hidden">
      <div className="absolute inset-0 bg-white/40 dark:bg-dark-950/60 transition-colors duration-300" />
      <div className="relative z-10">
        <Sidebar />
        
        {/* Mobile Header - Fixed for all mobile screens */}
        <div className="lg:hidden">
          <DashboardHeaderMobile
            onNotificationPress={() => {
              // Handle notifications
            }}
          />
        </div>

        {/* Desktop Layout */}
        <div className="lg:ml-64 relative">
          {/* Desktop Header - Only shown on desktop */}
          <div className="hidden lg:block">
            <Header />
          </div>
          <main className="min-h-[calc(100vh-4rem)] animate-fade-in-up lg:min-h-[calc(100vh-4rem)] pt-[calc(3.5rem+env(safe-area-inset-top,0px))] lg:pt-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
