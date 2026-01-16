import type { Team } from '@minc-hub/shared/types'

/**
 * Mapeia um identificador de equipe (número ou nome) para o ID da equipe correspondente
 */
export function mapTeamNumberToTeamId(teamIdentifier: string, teams: Team[]): string | null {
  if (!teamIdentifier || teams.length === 0) {
    return null
  }

  const normalizedIdentifier = teamIdentifier.toLowerCase().trim()

  // Try to match by exact name or name containing "Equipe {number}"
  const foundTeam = teams.find(team => {
    const teamNameNormalized = team.name.toLowerCase().trim()
    return (
      teamNameNormalized === normalizedIdentifier ||
      teamNameNormalized.includes(`equipe ${normalizedIdentifier}`) ||
      teamNameNormalized === `equipe ${normalizedIdentifier}`
    )
  })

  return foundTeam?.id ?? null
}
