import type { Church } from '@minc-hub/shared/types'
import { CompactListItem } from '@/components/ui/CompactListItem'

interface ChurchListItemProps {
  readonly church: Church
  readonly onEdit?: (church: Church) => void
  readonly onDelete?: (church: Church) => void
  readonly onClick?: (church: Church) => void
}

export function ChurchListItem({ church, onEdit, onDelete, onClick }: ChurchListItemProps) {
  return (
    <CompactListItem
      icon={
        <svg
          className="w-5 h-5 text-primary-600 dark:text-primary-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      }
      title={church.name}
      subtitle={church.address || undefined}
      metadata={church.phone || church.email || undefined}
      onClick={() => onClick?.(church)}
      onEdit={onEdit ? () => onEdit(church) : undefined}
      onDelete={onDelete ? () => onDelete(church) : undefined}
    />
  )
}
