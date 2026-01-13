export function UsersSearchBar({
  searchTerm,
  onSearchChange,
}: {
  readonly searchTerm: string
  readonly onSearchChange: (value: string) => void
}) {
  return (
    <div className="px-4 py-3 bg-white dark:bg-dark-950 mb-3 shadow-sm">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-dark-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-dark-200 dark:border-dark-700 rounded-lg leading-5 bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Buscar pessoas..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}
