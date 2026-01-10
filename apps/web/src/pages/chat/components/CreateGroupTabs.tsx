import { useState } from 'react'
import { TeamGroupCreation } from './TeamGroupCreation'

interface CreateGroupTabsProps {
  onCreateGroupFromTeam: (teamId: string, customName?: string) => Promise<void>
  renderAdHocTab: () => React.ReactNode
}

type TabType = 'adhoc' | 'team'

export function CreateGroupTabs({ onCreateGroupFromTeam, renderAdHocTab }: CreateGroupTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('adhoc')

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Header */}
      <div className="flex border-b border-dark-200 dark:border-dark-700 mb-4">
        <button
          onClick={() => setActiveTab('adhoc')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'adhoc'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-200'
          }`}
        >
          Grupos Avulsos
          {activeTab === 'adhoc' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'team'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-200'
          }`}
        >
          Grupos por Equipe
          {activeTab === 'team' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'adhoc' ? (
          renderAdHocTab()
        ) : (
          <TeamGroupCreation onCreateGroup={onCreateGroupFromTeam} />
        )}
      </div>
    </div>
  )
}
