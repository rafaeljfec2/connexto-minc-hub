type TabType = 'membros' | 'tarefas' | 'atividades'

interface TeamTabsProps {
  readonly activeTab: TabType
  readonly onTabChange: (tab: TabType) => void
}

export function TeamTabs({ activeTab, onTabChange }: TeamTabsProps) {
  const tabs: TabType[] = ['membros', 'tarefas', 'atividades']

  return (
    <div className="px-4 mb-4 lg:mt-6 shrink-0 lg:px-8">
      <div className="bg-gray-100 dark:bg-dark-900 p-1 rounded-xl flex">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}
