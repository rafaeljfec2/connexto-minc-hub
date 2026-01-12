import type { Team, Ministry } from '@minc-hub/shared/types'
import { TeamsSearchBar } from './TeamsSearchBar'
import { TeamsMinistryFilters } from './TeamsMinistryFilters'
import { TeamsSectionHeader } from './TeamsSectionHeader'
import { TeamsMobileListContent } from './TeamsMobileListContent'

interface TeamsMobileViewProps {
  readonly teams: Team[]
  readonly ministries: Ministry[]
  readonly isLoading: boolean
  readonly searchTerm: string
  readonly selectedMinistryFilter: string
  readonly hasFilters: boolean
  readonly onSearchChange: (value: string) => void
  readonly onMinistryFilterChange: (ministryId: string) => void
  readonly getMinistryName: (ministryId: string) => string
  readonly onTeamMenuClick: (team: Team) => void
  readonly onTeamClick: (team: Team) => void
}

export function TeamsMobileView({
  teams,
  ministries,
  isLoading,
  searchTerm,
  selectedMinistryFilter,
  hasFilters,
  onSearchChange,
  onMinistryFilterChange,
  getMinistryName,
  onTeamMenuClick,
  onTeamClick,
}: TeamsMobileViewProps) {
  return (
    <div className="lg:hidden fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 flex flex-col overflow-hidden bg-gray-50 dark:bg-dark-950">
      <TeamsSearchBar value={searchTerm} onChange={onSearchChange} />

      <TeamsMinistryFilters
        ministries={ministries}
        selectedMinistryId={selectedMinistryFilter}
        onSelect={onMinistryFilterChange}
      />

      <TeamsSectionHeader />

      <div className="bg-dark-50 dark:bg-dark-950 flex-1 overflow-y-auto px-4 py-4">
        <TeamsMobileListContent
          teams={teams}
          isLoading={isLoading}
          hasFilters={hasFilters}
          getMinistryName={getMinistryName}
          onTeamMenuClick={onTeamMenuClick}
          onTeamClick={onTeamClick}
        />
      </div>
    </div>
  )
}
