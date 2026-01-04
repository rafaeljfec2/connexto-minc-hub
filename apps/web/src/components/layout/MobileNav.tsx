import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  roles?: UserRole[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    roles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER, UserRole.MEMBER],
  },
  {
    label: 'Servos',
    href: '/people',
    roles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    label: 'Equipes',
    href: '/teams',
    roles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    label: 'Cultos',
    href: '/services',
    roles: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  {
    label: 'Escalas',
    href: '/schedules',
    roles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    label: 'Comunicação',
    href: '/communication',
    roles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  { label: 'Igrejas', href: '/churches', roles: [UserRole.ADMIN] },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, hasAnyRole } = useAuth()

  const visibleItems = navItems.filter(item => {
    if (!item.roles) return true
    return hasAnyRole(item.roles)
  })

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-lg text-dark-300 hover:text-dark-50 hover:bg-dark-800 transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-dark-950/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <nav
            className={cn(
              'fixed top-16 left-0 right-0 z-50 bg-dark-900 border-b border-dark-800',
              'lg:hidden transform transition-transform duration-200',
              isOpen ? 'translate-y-0' : '-translate-y-full'
            )}
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col gap-2">
                {visibleItems.map(item => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-lg text-dark-300 hover:text-dark-50 hover:bg-dark-800 transition-colors font-medium block"
                  >
                    {item.label}
                  </Link>
                ))}
                {user && (
                  <div className="mt-4 pt-4 border-t border-dark-800">
                    <div className="px-4 py-2 text-sm text-dark-400">{user.name}</div>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  )
}
