import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true' || !import.meta.env.VITE_API_URL

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 w-full border-b border-dark-800 bg-dark-950/95 backdrop-blur supports-[backdrop-filter]:bg-dark-950/80">
      <div className="lg:ml-64">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              {user && (
                <>
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
                </>
              )}
              {MOCK_MODE && !user && (
                <span className="text-xs text-primary-400 hidden sm:inline">
                  Modo Dev
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
