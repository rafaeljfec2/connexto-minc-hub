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
  readonly onTeamEdit: (team: Team) => void
  readonly onTeamDelete: (team: Team) => void
  readonly onTeamClick: (team: Team) => void
  readonly onCreateClick: () => void
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
  onTeamEdit,
  onTeamDelete,
  onTeamClick,
  onCreateClick,
}: TeamsMobileViewProps) {
  return (
    <div className="lg:hidden fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 flex flex-col overflow-hidden bg-transparent dark:bg-dark-950">
      <TeamsSearchBar value={searchTerm} onChange={onSearchChange} />

      <TeamsMinistryFilters
        ministries={ministries}
        selectedMinistryId={selectedMinistryFilter}
        onSelect={onMinistryFilterChange}
      />

      <TeamsSectionHeader onCreateClick={onCreateClick} />

      <div className="bg-transparent dark:bg-dark-950 flex-1 overflow-y-auto px-4 py-4">
        <TeamsMobileListContent
          teams={teams}
          isLoading={isLoading}
          hasFilters={hasFilters}
          getMinistryName={getMinistryName}
          onTeamEdit={onTeamEdit}
          onTeamDelete={onTeamDelete}
          onTeamClick={onTeamClick}
        />
      </div>
    </div>
  )
}
