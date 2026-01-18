import { FooterMobile } from '@/components/layout/FooterMobile'

interface MobileFooterProps {
  readonly show: boolean
}

export function MobileFooter({ show }: MobileFooterProps) {
  if (!show) {
    return null
  }

  return (
    <div className="lg:hidden">
      <FooterMobile />
    </div>
  )
}
