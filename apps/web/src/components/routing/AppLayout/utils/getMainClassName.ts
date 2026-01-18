interface PageTypeFlags {
  readonly isChatConversation: boolean
  readonly isChatPage: boolean
  readonly isProfilePage: boolean
  readonly isNewMessagePage: boolean
}

const BASE_CLASSES = 'flex-1 overflow-y-auto overscroll-y-contain animate-fade-in-up scroll-smooth'

export function getMainClassName(flags: PageTypeFlags): string {
  const { isChatConversation, isChatPage, isProfilePage, isNewMessagePage } = flags

  if (isChatConversation || isNewMessagePage) {
    return `${BASE_CLASSES} p-0 overflow-hidden`
  }

  if (isChatPage) {
    return `${BASE_CLASSES} p-0 lg:pt-0 overflow-hidden`
  }

  if (isProfilePage) {
    return `${BASE_CLASSES} pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pt-6 lg:pb-0 lg:px-8`
  }

  return `${BASE_CLASSES} pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(6.5rem+env(safe-area-inset-bottom))] px-4 lg:pt-6 lg:pb-0 lg:px-8`
}
