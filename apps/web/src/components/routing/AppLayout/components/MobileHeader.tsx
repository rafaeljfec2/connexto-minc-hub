import { DashboardHeaderMobile } from '@/pages/dashboard/components/DashboardHeaderMobile'

interface MobileHeaderProps {
  readonly show: boolean
}

export function MobileHeader({ show }: MobileHeaderProps) {
  if (!show) {
    return null
  }

  return (
    <div className="lg:hidden">
      <DashboardHeaderMobile
        onNotificationPress={() => {
          // Handle notifications
        }}
        showChurchSelector={false}
      />
    </div>
  )
}
