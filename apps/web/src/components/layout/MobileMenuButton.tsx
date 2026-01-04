import { MenuIcon, CloseIcon } from '@/components/icons'

interface MobileMenuButtonProps {
  isOpen: boolean
  onClick: () => void
}

export function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-dark-900 border border-dark-800 text-dark-300 hover:text-dark-50 transition-colors"
      aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
    >
      {isOpen ? <CloseIcon /> : <MenuIcon />}
    </button>
  )
}
