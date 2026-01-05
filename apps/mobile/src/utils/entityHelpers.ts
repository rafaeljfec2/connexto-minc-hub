import type { Person, Ministry, Team, Service, Schedule } from '@minc-hub/shared/types'

export function getMinistry(person: Person, ministries: Ministry[]): Ministry | undefined {
  if (!person.ministryId) return undefined
  return ministries.find(m => m.id === person.ministryId)
}

export function getTeam(person: Person, teams: Team[]): Team | undefined {
  if (!person.teamId) return undefined
  return teams.find(t => t.id === person.teamId)
}

export function getChurchName(ministry: Ministry, churches: Array<{ id: string; name: string }>): string | undefined {
  return churches.find(c => c.id === ministry.churchId)?.name
}

export function getServiceName(serviceId: string, services: Service[]): string | undefined {
  return services.find(s => s.id === serviceId)?.name
}

export function getTeamNames(teamIds: string[], teams: Team[]): string {
  return teamIds
    .map(id => teams.find(t => t.id === id)?.name)
    .filter(Boolean)
    .join(', ')
}
