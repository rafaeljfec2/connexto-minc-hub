import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { BrandText } from '@/components/ui/BrandText'
import { MobileNav } from './MobileNav'

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true' || !import.meta.env.VITE_API_URL

export function Header() {
  const { user, logout } = useAuth()
  const showNav = MOCK_MODE || user

  return (
    <header className="sticky top-0 z-50 w-full border-b border-dark-800 bg-dark-950/95 backdrop-blur supports-[backdrop-filter]:bg-dark-950/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img
                src="/Logo-minc.png"
                alt="MINC Logo"
                className="h-8 w-auto object-contain"
              />
              <BrandText size="md" className="hidden sm:inline" />
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-6">
              {showNav && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-dark-300 hover:text-dark-50 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/people"
                    className="text-sm font-medium text-dark-300 hover:text-dark-50 transition-colors"
                  >
                    Pessoas
                  </Link>
                  <Link
                    to="/teams"
                    className="text-sm font-medium text-dark-300 hover:text-dark-50 transition-colors"
                  >
                    Equipes
                  </Link>
                  <Link
                    to="/schedules"
                    className="text-sm font-medium text-dark-300 hover:text-dark-50 transition-colors"
                  >
                    Escalas
                  </Link>
                </>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-dark-400 hidden sm:inline">
                  {user.name}
                </span>
                {!MOCK_MODE && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-sm"
                  >
                    Sair
                  </Button>
                )}
                <MobileNav />
              </div>
            ) : MOCK_MODE ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-primary-400 hidden sm:inline">
                  Modo Dev
                </span>
                <MobileNav />
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Entrar
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
