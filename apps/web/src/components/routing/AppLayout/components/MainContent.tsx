import type { ReactNode } from 'react'
import { DesktopHeader } from './DesktopHeader'

interface MainContentProps {
  readonly children: ReactNode
  readonly className: string
  readonly isChatConversation: boolean
  readonly showDesktopHeader: boolean
}

export function MainContent({
  children,
  className,
  isChatConversation,
  showDesktopHeader,
}: MainContentProps) {
  const backgroundClass = isChatConversation ? 'bg-gray-50' : 'bg-gray-200'

  return (
    <div
      className={`h-screen w-screen overflow-hidden dark:bg-dark-950 lg:bg-grain relative animate-fade-in supports-[height:100dvh]:h-[100dvh] ${backgroundClass}`}
    >
      {/* Overlay only for grain effect on desktop */}
      <div className="hidden lg:block absolute inset-0 bg-white/40 dark:bg-dark-950/60 transition-colors duration-300" />
      <div className="relative z-10 h-full flex flex-col lg:block">
        {/* Desktop Layout Content */}
        <div className="lg:ml-64 h-full relative flex flex-col">
          <DesktopHeader show={showDesktopHeader} />
          <main className={className}>{children}</main>
        </div>
      </div>
    </div>
  )
}
