import { useLocation } from 'react-router-dom'

interface PageType {
  readonly isChatPage: boolean
  readonly isChatConversation: boolean
  readonly isProfilePage: boolean
  readonly isNewMessagePage: boolean
  readonly isPersonFormPage: boolean
  readonly shouldShowMobileHeader: boolean
  readonly shouldShowMobileFooter: boolean
  readonly shouldShowDesktopHeader: boolean
}

const PERSON_FORM_PATTERN = /^\/people\/[^/]+\/edit$/

export function usePageType(): PageType {
  const location = useLocation()
  const pathname = location.pathname

  const isChatPage = pathname.startsWith('/chat')
  const isChatConversation = pathname.startsWith('/chat/')
  const isProfilePage = pathname === '/profile'
  const isNewMessagePage = pathname === '/communication/new'
  const isPersonFormPage = pathname === '/people/new' || PERSON_FORM_PATTERN.test(pathname)

  const shouldShowMobileHeader =
    !isChatConversation && !isChatPage && !isNewMessagePage && !isPersonFormPage

  const shouldShowMobileFooter = !isChatConversation

  const shouldShowDesktopHeader = !isChatPage

  return {
    isChatPage,
    isChatConversation,
    isProfilePage,
    isNewMessagePage,
    isPersonFormPage,
    shouldShowMobileHeader,
    shouldShowMobileFooter,
    shouldShowDesktopHeader,
  }
}
