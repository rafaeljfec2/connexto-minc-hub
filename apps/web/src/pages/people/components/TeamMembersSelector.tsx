import { useState, useMemo } from 'react'
import { ComboBox, type ComboBoxOption } from '@/components/ui/ComboBox'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Team, Ministry, MemberType } from '@minc-hub/shared/types'
import { TrashIcon, PlusIcon } from '@/components/icons'

interface TeamMemberItem {
  teamId: string
  memberType: MemberType
}

interface TeamMembersSelectorProps {
  readonly teams: Team[]
  readonly ministries: Ministry[]
  readonly selectedMinistryId?: string
  readonly value: TeamMemberItem[]
  readonly onChange: (value: TeamMemberItem[]) => void
  readonly disabled?: boolean
}

export function TeamMembersSelector({
  teams,
  ministries,
  selectedMinistryId,
  value,
  onChange,
  disabled = false,
}: TeamMembersSelectorProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [selectedMemberType, setSelectedMemberType] = useState<MemberType>(MemberType.FIXED)

  // Filter teams by selected ministry
  const availableTeams = useMemo(() => {
    if (selectedMinistryId) {
      return teams.filter(t => t.ministryId === selectedMinistryId && t.isActive)
    }
    return teams.filter(t => t.isActive)
  }, [teams, selectedMinistryId])

  // Get teams already selected
  const selectedTeamIds = useMemo(() => {
    return new Set(value.map(item => item.teamId))
  }, [value])

  // Filter out already selected teams
  const selectableTeams = useMemo(() => {
    return availableTeams.filter(team => !selectedTeamIds.has(team.id))
  }, [availableTeams, selectedTeamIds])

  // Convert teams to ComboBox options
  const teamOptions: ComboBoxOption<string>[] = useMemo(() => {
    return selectableTeams.map(team => {
      const ministry = ministries.find(m => m.id === team.ministryId)
      const ministryLabel = ministry ? ` (${ministry.name})` : ''
      return {
        value: team.id,
        label: `${team.name}${ministryLabel}`,
      }
    })
  }, [selectableTeams, ministries])

  // Member type options for ComboBox
  const memberTypeOptions: ComboBoxOption<MemberType>[] = [
    { value: MemberType.FIXED, label: 'Fixo' },
    { value: MemberType.EVENTUAL, label: 'Eventual' },
  ]

  const handleAddTeam = () => {
    if (!selectedTeamId) return

    const newItem: TeamMemberItem = {
      teamId: selectedTeamId,
      memberType: selectedMemberType,
    }

    onChange([...value, newItem])
    setSelectedTeamId('')
    setSelectedMemberType(MemberType.FIXED)
  }

  const handleRemoveTeam = (teamId: string) => {
    onChange(value.filter(item => item.teamId !== teamId))
  }

  const handleMemberTypeChange = (teamId: string, newMemberType: MemberType) => {
    onChange(
      value.map(item => (item.teamId === teamId ? { ...item, memberType: newMemberType } : item))
    )
  }

  const getTeamName = (teamId: string): string => {
    const team = teams.find(t => t.id === teamId)
    return team?.name ?? '-'
  }

  return (
    <div className="space-y-4">
      {/* Header with description */}
      <div className="space-y-1">
        <p className="text-xs text-dark-600 dark:text-dark-400">
          Adicione as equipes em que este servo participa e defina se é membro fixo ou ajuda
          eventual
        </p>
      </div>

      {/* Add team controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 min-w-0">
          <ComboBox
            options={teamOptions}
            value={selectedTeamId || null}
            onValueChange={val => setSelectedTeamId(val || '')}
            placeholder="Selecione uma equipe"
            searchable
            searchPlaceholder="Buscar equipe..."
            disabled={disabled || selectableTeams.length === 0}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-36">
          <ComboBox
            options={memberTypeOptions}
            value={selectedMemberType}
            onValueChange={val => val && setSelectedMemberType(val)}
            disabled={disabled}
            searchable={false}
            className="w-full"
          />
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={handleAddTeam}
          disabled={disabled || !selectedTeamId || selectableTeams.length === 0}
          className="px-4 sm:px-3 h-10"
          title="Adicionar equipe"
        >
          <PlusIcon className="h-4 w-4 sm:mr-0" />
          <span className="sm:hidden ml-2">Adicionar</span>
        </Button>
      </div>

      {/* Selected teams list */}
      {value.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-dark-800 dark:text-dark-200">
              Equipes selecionadas
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              {value.length}
            </span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-dark-300 dark:scrollbar-thumb-dark-600">
            {value.map(item => {
              const team = teams.find(t => t.id === item.teamId)
              const ministry = team ? ministries.find(m => m.id === team.ministryId) : null
              const isFixed = item.memberType === MemberType.FIXED

              return (
                <div
                  key={item.teamId}
                  className="group flex items-start gap-3 p-3 bg-white dark:bg-dark-800/50 rounded-lg border border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Team info */}
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-dark-900 dark:text-dark-50">
                            {getTeamName(item.teamId)}
                          </span>
                          {ministry && (
                            <span className="text-xs text-dark-500 dark:text-dark-400 bg-dark-100 dark:bg-dark-700/50 px-2 py-0.5 rounded">
                              {ministry.name}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Member type badge */}
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap',
                          isFixed
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {isFixed ? 'Fixo' : 'Eventual'}
                      </span>
                    </div>

                    {/* Member type selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-dark-600 dark:text-dark-400 whitespace-nowrap">
                        Tipo:
                      </span>
                      <ComboBox
                        options={memberTypeOptions}
                        value={item.memberType}
                        onValueChange={val => val && handleMemberTypeChange(item.teamId, val)}
                        disabled={disabled}
                        searchable={false}
                        className="h-8 text-xs flex-1"
                      />
                    </div>
                  </div>

                  {/* Remove button */}
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveTeam(item.teamId)}
                    disabled={disabled}
                    className="px-2 opacity-70 group-hover:opacity-100 transition-opacity"
                    title="Remover equipe"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {selectableTeams.length === 0 && value.length === 0 && (
        <div className="text-center py-6 px-4 bg-dark-50 dark:bg-dark-900/50 rounded-lg border border-dashed border-dark-300 dark:border-dark-700">
          <p className="text-sm text-dark-600 dark:text-dark-400">
            Nenhuma equipe disponível. Selecione um time primeiro.
          </p>
        </div>
      )}
    </div>
  )
}
