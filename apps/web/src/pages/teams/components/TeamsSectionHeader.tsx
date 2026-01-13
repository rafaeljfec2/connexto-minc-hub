interface TeamsSectionHeaderProps {
  readonly onCreateClick: () => void
}

export function TeamsSectionHeader({ onCreateClick }: TeamsSectionHeaderProps) {
  return (
    <div className="px-4 py-3 bg-transparent dark:bg-dark-950 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-dark-900 dark:text-dark-50">Minhas Equipes</h2>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova
        </button>
      </div>
    </div>
  )
}
