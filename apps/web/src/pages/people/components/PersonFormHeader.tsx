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

  // Mobile: Fixed header with back button - positioned directly below main header
  if (!isDesktop) {
    return (
      <div className="fixed top-[calc(3.25rem+env(safe-area-inset-top,0px))] left-0 right-0 z-20 w-full border-b border-dark-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-dark-800 dark:bg-dark-950/95 dark:supports-[backdrop-filter]:dark:bg-dark-950/80">
        <div className="flex items-center justify-center gap-3 px-4 py-3 relative">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="p-2 absolute left-0"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold text-dark-900 dark:text-dark-50">
            {isEditMode ? 'Editar Servo' : 'Novo Servo'}
          </h1>
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
