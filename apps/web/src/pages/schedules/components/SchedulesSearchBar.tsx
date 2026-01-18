interface SchedulesSearchBarProps {
  readonly value: string
  readonly onChange: (value: string) => void
}

export function SchedulesSearchBar({ value, onChange }: SchedulesSearchBarProps) {
  return (
    <div className="px-4 pb-2 bg-transparent dark:bg-dark-950 flex-shrink-0">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-dark-400 dark:text-dark-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Buscar por culto ou data..."
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-lg text-sm text-dark-900 dark:text-dark-50 placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}
