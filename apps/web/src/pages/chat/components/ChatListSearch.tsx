interface ChatListSearchProps {
  readonly value: string
  readonly onChange: (value: string) => void
}

export function ChatListSearch({ value, onChange }: ChatListSearchProps) {
  return (
    <div className="relative mt-4">
      <input
        type="text"
        placeholder="Buscar..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 bg-dark-50 dark:bg-dark-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary-500"
      />
      <svg
        className="absolute left-3 top-2.5 w-4 h-4 text-dark-400"
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
  )
}
