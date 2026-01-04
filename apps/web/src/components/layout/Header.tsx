import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { useNavigate } from 'react-router-dom'

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true' || !import.meta.env.VITE_API_URL

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const profileItems = [
    {
      label: 'Meu Perfil',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      onClick: () => navigate('/profile'),
    },
    {
      label: 'Configurações',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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
      onClick: () => navigate('/settings'),
    },
    {
      label: 'Sair',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
      onClick: () => {
        if (!MOCK_MODE) {
          logout()
        }
      },
      variant: 'danger' as const,
    },
  ]

  return (
    <header className="sticky top-0 z-30 w-full border-b border-dark-800 bg-dark-950/95 backdrop-blur supports-[backdrop-filter]:bg-dark-950/80">
      <div className="lg:ml-64">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/Logo-minc.png"
                alt="Minha Igreja na Cidade"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <Dropdown
                  trigger={
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-medium text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-dark-300 hidden sm:inline">
                        {user.name}
                      </span>
                      <svg
                        className="h-4 w-4 text-dark-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  }
                  items={profileItems}
                  align="right"
                />
              ) : MOCK_MODE ? (
                <span className="text-xs text-primary-400 hidden sm:inline">
                  Modo Dev
                </span>
              ) : (
                <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
