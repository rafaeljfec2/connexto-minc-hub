import { Header } from '@/components/layout/Header'

interface DesktopHeaderProps {
  readonly show: boolean
}

export function DesktopHeader({ show }: DesktopHeaderProps) {
  if (!show) {
    return null
  }

  return (
    <div className="hidden lg:block flex-shrink-0">
      <Header />
    </div>
  )
}
