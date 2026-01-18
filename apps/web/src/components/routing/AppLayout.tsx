import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { ChatProvider } from '@/contexts/ChatContext'
import { PWAInstallModal } from '@/components/pwa/PWAInstallModal'
import { usePageType } from './AppLayout/hooks/usePageType'
import { useServiceWorker } from './AppLayout/hooks/useServiceWorker'
import { getMainClassName } from './AppLayout/utils/getMainClassName'
import { MobileHeader } from './AppLayout/components/MobileHeader'
import { MobileFooter } from './AppLayout/components/MobileFooter'
import { MainContent } from './AppLayout/components/MainContent'

interface AppLayoutProps {
  readonly children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pageType = usePageType()
  useServiceWorker()

  const mainClassName = getMainClassName({
    isChatConversation: pageType.isChatConversation,
    isChatPage: pageType.isChatPage,
    isProfilePage: pageType.isProfilePage,
    isNewMessagePage: pageType.isNewMessagePage,
  })

  return (
    <ChatProvider>
      <PWAInstallModal />
      <Sidebar />

      <MobileHeader show={pageType.shouldShowMobileHeader} />
      <MobileFooter show={pageType.shouldShowMobileFooter} />

      <MainContent
        className={mainClassName}
        isChatConversation={pageType.isChatConversation}
        showDesktopHeader={pageType.shouldShowDesktopHeader}
      >
        {children}
      </MainContent>
    </ChatProvider>
  )
}
