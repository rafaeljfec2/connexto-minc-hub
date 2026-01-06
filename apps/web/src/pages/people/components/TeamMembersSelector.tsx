import { useState, useMemo } from 'react'
import { ComboBox, type ComboBoxOption } from '@/components/ui/ComboBox'

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
      return {
        value: team.id,
        label: `${team.name}${ministry ? ` (${ministry.name})` : ''}`,
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
    return team?.name ?? 'Equipe desconhecida'
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
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
        <div className="w-40">
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
          className="px-4"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
            Equipes selecionadas ({value.length})
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {value.map(item => {
              const team = teams.find(t => t.id === item.teamId)
              const ministry = team ? ministries.find(m => m.id === team.ministryId) : null

              return (
                <div
                  key={item.teamId}
                  className="flex items-center gap-2 p-3 bg-dark-50 dark:bg-dark-900 rounded-lg border border-dark-200 dark:border-dark-800"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                        {getTeamName(item.teamId)}
                      </span>
                      {ministry && (
                        <span className="text-xs text-dark-500 dark:text-dark-400">
                          ({ministry.name})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <ComboBox
                        options={memberTypeOptions}
                        value={item.memberType}
                        onValueChange={val => val && handleMemberTypeChange(item.teamId, val)}
                        disabled={disabled}
                        searchable={false}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveTeam(item.teamId)}
                    disabled={disabled}
                    className="px-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {selectableTeams.length === 0 && value.length === 0 && (
        <p className="text-sm text-dark-500 dark:text-dark-400">
          Nenhuma equipe disponível. Selecione um time primeiro.
        </p>
      )}
    </div>
  )
}
