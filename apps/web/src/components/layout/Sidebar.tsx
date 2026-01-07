import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@minc-hub/shared/types'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarBranding } from './SidebarBranding'
import { SidebarUserInfo } from './SidebarUserInfo'
import { MobileMenuButton } from './MobileMenuButton'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: UserRole[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    roles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE, UserRole.SERVO],
  },
  {
    label: 'Mincs',
    href: '/churches',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    roles: [UserRole.PASTOR],
  },
  {
    label: 'Cultos',
    href: '/services',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    roles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME],
  },
  {
    label: 'Times',
    href: '/ministries',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    roles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME],
  },
  {
    label: 'Equipes',
    href: '/teams',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    roles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE],
  },
  {
    label: 'Servos',
    href: '/people',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    roles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE],
  },
  {
    label: 'Usuários',
    href: '/users',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    roles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME],
  },
  {
    label: 'Escalas',
    href: '/schedules',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    roles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE],
  },
  {
    label: 'Sorteio Mensal',
    href: '/monthly-schedules',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    roles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE],
  },
  {
    label: 'Config. Planejamento',
    href: '/schedule-planning-config',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    roles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME],
  },
  {
    label: 'Comunicação',
    href: '/communication',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    roles: [UserRole.PASTOR, UserRole.LIDER_DE_TIME, UserRole.LIDER_DE_EQUIPE],
  },
]

export function Sidebar() {
  const location = useLocation()
  const { user, hasAnyRole } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const isChatPage = location.pathname.startsWith('/chat')

  const visibleItems = navItems.filter(item => {
    if (!item.roles) return true

    if (!user) return true

    const userRole = String(user.role).toLowerCase()
    if (userRole === 'admin') return true
    return hasAnyRole(item.roles)
  })

  const renderNavItems = (onItemClick?: () => void) => {
    if (visibleItems.length === 0) {
      return (
        <div className="p-4 text-sm text-dark-500 dark:text-dark-400">
          Nenhum item de menu disponível
        </div>
      )
    }

    return (
      <div className="space-y-1">
        {visibleItems.map(item => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.href}
            onClick={onItemClick}
          />
        ))}
      </div>
    )
  }

  const sidebarContent = (
    <>
      <SidebarBranding />
      <nav className="flex-1 overflow-y-auto p-4">{renderNavItems()}</nav>
      {user && <SidebarUserInfo user={user} />}
    </>
  )

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-dark-200 dark:bg-dark-900 dark:border-dark-800 fixed left-0 top-0 h-screen z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Menu - Hidden on chat pages */}
      {!isChatPage && (
        <div className="lg:hidden">
          <MobileMenuButton isOpen={isMobileOpen} onClick={() => setIsMobileOpen(!isMobileOpen)} />

        {isMobileOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 bg-white/50 dark:bg-dark-950/50 backdrop-blur-sm z-40 cursor-pointer animate-fade-in"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Fechar menu"
            />
            <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-dark-200 dark:bg-dark-900 dark:border-dark-800 z-50 overflow-y-auto flex flex-col animate-slide-in-left">
              <SidebarBranding />
              <nav className="flex-1 overflow-y-auto p-4">
                {renderNavItems(() => setIsMobileOpen(false))}
              </nav>
              {user && <SidebarUserInfo user={user} />}
            </aside>
          </>
        )}
        </div>
      )}
    </>
  )
}
