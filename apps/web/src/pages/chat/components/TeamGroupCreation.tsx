import { useState, useEffect, useMemo } from 'react'
import { teamsService } from '@/services/api'
import { Team, Ministry } from '@minc-hub/shared/types'

interface TeamWithMinistry extends Team {
  ministry?: Ministry
}

interface TeamGroupCreationProps {
  onCreateGroup: (teamId: string, customName?: string) => Promise<void>
}

export function TeamGroupCreation({ onCreateGroup }: TeamGroupCreationProps) {
  const [teams, setTeams] = useState<TeamWithMinistry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMinistry | null>(null)
  const [customName, setCustomName] = useState('')

  // Helper function to extract error message
  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'response' in error) {
      const responseError = error as {
        response?: { data?: { message?: string } }
        message?: string
      }
      return responseError.response?.data?.message || responseError.message || 'Erro desconhecido'
    }
    if (error instanceof Error) {
      return error.message
    }
    return 'Erro desconhecido'
  }

  // Fetch teams on mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsList = await teamsService.getAll()
        setTeams(teamsList)
      } catch (error) {
        console.error('Failed to fetch teams:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTeams()
  }, [])

  const filteredTeams = useMemo(() => {
    if (!searchQuery) return teams
    const query = searchQuery.toLowerCase()
    return teams.filter(
      team =>
        team.name.toLowerCase().includes(query) || team.ministry?.name.toLowerCase().includes(query)
    )
  }, [teams, searchQuery])

  const handleSelectTeam = (team: TeamWithMinistry) => {
    setSelectedTeam(team)
    setCustomName(`Grupo ${team.name}`)
  }

  const handleCreateGroup = async () => {
    if (!selectedTeam) return
    setIsCreating(true)
    try {
      await onCreateGroup(selectedTeam.id, customName || undefined)
      setSelectedTeam(null)
      setCustomName('')
    } catch (error: unknown) {
      console.error('Failed to create group from team:', error)
      alert(`Falha ao criar grupo: ${getErrorMessage(error)}`)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // Show confirmation modal if team is selected
  if (selectedTeam) {
    return (
      <div className="space-y-4">
        <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-dark-900 dark:text-dark-50 mb-2">
            Criar grupo a partir da equipe:
          </h3>
          <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
            {selectedTeam.name}
          </p>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
            {selectedTeam.memberIds?.length || 0} membros serão adicionados
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
            Nome do Grupo
          </label>
          <input
            type="text"
            className="block w-full px-3 py-2 border border-dark-200 dark:border-dark-700 rounded-lg leading-5 bg-white dark:bg-dark-800 placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-dark-900 dark:text-dark-50 transition-colors"
            placeholder="Nome do grupo"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setSelectedTeam(null)}
            className="px-4 py-2 text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={!customName.trim() || isCreating}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Criando...
              </>
            ) : (
              'Criar Grupo'
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-dark-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-dark-200 dark:border-dark-700 rounded-lg leading-5 bg-white dark:bg-dark-800 placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-dark-900 dark:text-dark-50 transition-colors"
          placeholder="Buscar equipes..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Teams List */}
      <div className="max-h-[400px] overflow-y-auto">
        {filteredTeams.length === 0 ? (
          <div className="text-center py-8 text-dark-500 dark:text-dark-400">
            {searchQuery ? 'Nenhuma equipe encontrada.' : 'Nenhuma equipe disponível.'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTeams.map((team: TeamWithMinistry) => (
              <button
                key={team.id}
                onClick={() => handleSelectTeam(team)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors text-left group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                    {team.ministry?.name || 'Ministério'} - {team.name}
                  </p>
                  <p className="text-xs text-dark-500 dark:text-dark-400">
                    {team.memberIds?.length || 0} membros
                  </p>
                </div>
                <svg
                  className="h-5 w-5 text-dark-400 group-hover:text-primary-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
