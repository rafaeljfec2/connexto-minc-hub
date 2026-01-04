import { ReactNode } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

interface CrudPageLayoutProps {
  readonly title: string
  readonly description?: string
  readonly icon?: ReactNode
  readonly createButtonLabel: string
  readonly onCreateClick: () => void
  readonly hasFilters: boolean
  readonly isEmpty: boolean
  readonly emptyTitle: string
  readonly emptyDescription?: string
  readonly filters: ReactNode
  readonly content: ReactNode
  readonly createButtonIcon?: ReactNode
}

export function CrudPageLayout({
  title,
  description,
  icon,
  createButtonLabel,
  onCreateClick,
  hasFilters,
  isEmpty,
  emptyTitle,
  emptyDescription,
  filters,
  content,
  createButtonIcon,
}: CrudPageLayoutProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        action={
          <Button onClick={onCreateClick} variant="primary" className="w-full sm:w-auto">
            {createButtonIcon}
            {createButtonLabel}
          </Button>
        }
      />

      {filters}

      {isEmpty ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={
            !hasFilters ? (
              <Button onClick={onCreateClick} variant="primary">
                {createButtonIcon}
                {createButtonLabel}
              </Button>
            ) : undefined
          }
        />
      ) : (
        content
      )}
    </div>
  )
}
