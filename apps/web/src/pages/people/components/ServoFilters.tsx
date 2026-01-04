import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SearchIcon } from '@/components/icons'
import { Ministry, Team } from '@/types'

interface ServoFiltersProps {
  readonly searchTerm: string
  readonly onSearchChange: (value: string) => void
  readonly filterMinistry: string
  readonly onMinistryChange: (value: string) => void
  readonly filterTeam: string
  readonly onTeamChange: (value: string) => void
  readonly ministries: Ministry[]
  readonly teams: Team[]
  readonly availableTeams: Team[]
}

export function ServoFilters({
  searchTerm,
  onSearchChange,
  filterMinistry,
  onMinistryChange,
  filterTeam,
  onTeamChange,
  ministries,
  availableTeams,
}: ServoFiltersProps) {
  const ministryOptions = [
    { value: 'all', label: 'Todos os times' },
    ...ministries
      .filter((m) => m.isActive)
      .map((m) => ({ value: m.id, label: m.name })),
  ]

  const teamOptions = [
    { value: 'all', label: 'Todas as equipes' },
    ...availableTeams.map((t) => ({ value: t.id, label: t.name })),
  ]

  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-500 dark:text-dark-400" />
            <Input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <Select
              value={filterMinistry}
              onChange={(e) => onMinistryChange(e.target.value)}
              options={ministryOptions}
            />
          </div>
          <div>
            <Select
              value={filterTeam}
              onChange={(e) => onTeamChange(e.target.value)}
              disabled={filterMinistry === 'all'}
              options={teamOptions}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
