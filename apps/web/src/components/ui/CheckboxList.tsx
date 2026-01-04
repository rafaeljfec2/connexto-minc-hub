interface CheckboxItem {
  id: string
  label: string
}

interface CheckboxListProps {
  items: CheckboxItem[]
  selectedIds: string[]
  onToggle: (id: string) => void
  maxHeight?: string
}

export function CheckboxList({
  items,
  selectedIds,
  onToggle,
  maxHeight = 'max-h-48',
}: CheckboxListProps) {
  return (
    <div
      className={`space-y-2 overflow-y-auto border border-dark-200 dark:border-dark-800 rounded-lg p-3 bg-white dark:bg-dark-900 ${maxHeight}`}
    >
      {items.map((item) => (
        <label
          key={item.id}
          className="flex items-center gap-2 cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-800/30 p-2 rounded transition-colors"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(item.id)}
            onChange={() => onToggle(item.id)}
            className="rounded border-dark-300 dark:border-dark-700 text-primary-600 focus:ring-primary-500 bg-white dark:bg-dark-900"
          />
          <span className="text-sm text-dark-700 dark:text-dark-200">{item.label}</span>
        </label>
      ))}
    </div>
  )
}
