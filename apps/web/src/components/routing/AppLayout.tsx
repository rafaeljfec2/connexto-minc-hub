import type { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

interface AppLayoutProps {
  readonly children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-grain relative animate-fade-in overflow-x-hidden">
      <div className="absolute inset-0 bg-white/40 dark:bg-dark-950/60 transition-colors duration-300" />
      <div className="relative z-10">
        <Sidebar />
        <div className="lg:ml-64 relative">
          <Header />
          <main className="min-h-[calc(100vh-4rem)] animate-fade-in-up">{children}</main>
        </div>
      </div>
    </div>
  )
}
