import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface PersonFormHeaderProps {
  readonly isEditMode: boolean
  readonly onBack: () => void
}

export function PersonFormHeader({ isEditMode, onBack }: PersonFormHeaderProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Mobile: Fixed header with back button only - positioned at top (replaces main header)
  if (!isDesktop) {
    return (
      <div className="fixed top-0 left-0 right-0 z-30 w-full border-b border-dark-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-dark-800 dark:bg-dark-950/95 dark:supports-[backdrop-filter]:dark:bg-dark-950/80 safe-area-top pt-[env(safe-area-inset-top)]">
        <div className="flex items-center px-2 h-10">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="p-1.5"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  // Desktop: PageHeader component
  return (
    <PageHeader
      title={isEditMode ? 'Editar Servo' : 'Novo Servo'}
      description={
        isEditMode ? 'Atualize as informações do servo' : 'Adicione um novo servo ao sistema'
      }
    />
  )
}
