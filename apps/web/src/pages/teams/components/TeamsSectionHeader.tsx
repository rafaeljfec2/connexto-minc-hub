export function TeamsSectionHeader() {
  return (
    <div className="px-4 py-3 bg-white dark:bg-dark-950 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-dark-900 dark:text-dark-50">Minhas Equipes</h2>
        <button className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
          Ver todas
        </button>
      </div>
    </div>
  )
}
