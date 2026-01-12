import type { Ministry } from '@minc-hub/shared/types'
import { CompactListItem } from '@/components/ui/CompactListItem'

interface MinistryListItemProps {
  readonly ministry: Ministry
  readonly churchName: string
  readonly onEdit?: (ministry: Ministry) => void
  readonly onDelete?: (ministry: Ministry) => void
  readonly onClick?: (ministry: Ministry) => void
}

export function MinistryListItem({
  ministry,
  churchName,
  onEdit,
  onDelete,
  onClick,
}: MinistryListItemProps) {
  return (
    <CompactListItem
      icon={
        <svg
          className="w-5 h-5 text-primary-600 dark:text-primary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      }
      title={ministry.name}
      subtitle={ministry.description}
      metadata={churchName}
      badge={
        ministry.isActive
          ? { text: 'Ativo', variant: 'success' }
          : { text: 'Inativo', variant: 'default' }
      }
      onClick={() => onClick?.(ministry)}
      onEdit={onEdit ? () => onEdit(ministry) : undefined}
      onDelete={onDelete ? () => onDelete(ministry) : undefined}
    />
  )
}
