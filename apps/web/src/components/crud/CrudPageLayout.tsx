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
  readonly additionalActions?: ReactNode
  readonly headerActions?: ReactNode
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
  additionalActions,
  headerActions,
}: CrudPageLayoutProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-6 sm:pb-8 lg:pt-4 lg:pb-8">
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        action={
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {additionalActions}
              <Button onClick={onCreateClick} variant="primary" className="w-full sm:w-auto">
                {createButtonIcon}
                {createButtonLabel}
              </Button>
            </div>
            {headerActions && <div className="w-full">{headerActions}</div>}
          </div>
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
