import { useAuth } from '@/contexts/AuthContext'
import { useMockMode } from '@/hooks/useMockMode'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { useNavigate } from 'react-router-dom'
import { UserIcon, SettingsIcon, LogoutIcon, ChevronDownIcon } from '@/components/icons'

export function HeaderProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isMockMode = useMockMode()

  const profileItems = [
    {
      label: 'Meu Perfil',
      icon: <UserIcon />,
      onClick: () => navigate('/profile'),
    },
    {
      label: 'Configurações',
      icon: <SettingsIcon />,
      onClick: () => navigate('/settings'),
    },
    {
      label: 'Sair',
      icon: <LogoutIcon />,
      onClick: () => {
        if (!isMockMode) {
          logout()
        }
      },
      variant: 'danger' as const,
    },
  ]

  if (user) {
    return (
      <Dropdown
        trigger={
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-all duration-200"
          >
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-medium text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-dark-700 dark:text-dark-300 hidden sm:inline">
              {user.name}
            </span>
            <ChevronDownIcon className="h-4 w-4 text-dark-500 dark:text-dark-400" />
          </button>
        }
        items={profileItems}
        align="right"
      />
    )
  }

  if (isMockMode) {
    return <span className="text-xs text-primary-400 hidden sm:inline">Modo Dev</span>
  }

  return (
    <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
      Entrar
    </Button>
  )
}
