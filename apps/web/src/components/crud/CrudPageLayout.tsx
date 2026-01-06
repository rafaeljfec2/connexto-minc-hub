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
  readonly isLoading?: boolean
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
  isLoading = false,
}: CrudPageLayoutProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-6 sm:pb-8 lg:py-8">
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

      {!isLoading && isEmpty ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={
            hasFilters ? undefined : (
              <Button onClick={onCreateClick} variant="primary">
                {createButtonIcon}
                {createButtonLabel}
              </Button>
            )
          }
        />
      ) : (
        content
      )}
    </div>
  )
}
