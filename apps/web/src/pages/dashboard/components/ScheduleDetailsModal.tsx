import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Schedule, Service, Team, Person, Ministry } from '@minc-hub/shared/types'
import { parseLocalDate, formatTime } from '@/lib/utils'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'

const apiServices = createApiServices(api)

interface ScheduleDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  schedule: Schedule | null
  service: Service | null
  teams: Team[]
  people: Person[]
  ministries: Ministry[]
}

interface TeamWithMembers extends Team {
  leaderIds?: string[]
  memberDetails?: Array<{ personId: string; role: string; person?: Person }>
}

export function ScheduleDetailsModal({
  isOpen,
  onClose,
  schedule,
  service,
  teams,
  people,
  ministries,
}: ScheduleDetailsModalProps) {
  const [teamsWithMembers, setTeamsWithMembers] = useState<TeamWithMembers[]>([])

  useEffect(() => {
    if (!schedule || !isOpen) return

    const fetchTeamMembers = async () => {
      const scheduledTeamIds = schedule.teamIds
      const scheduledTeams = teams.filter(team => scheduledTeamIds.includes(team.id))

      const teamsWithMembersData = await Promise.all(
        scheduledTeams.map(async team => {
          try {
            const members = await apiServices.teamsService.getMembers(team.id)
            const leaderIds = members.filter(m => m.role === 'lider_de_equipe').map(m => m.personId)

            return {
              ...team,
              leaderIds,
              memberDetails: members,
            }
          } catch (error) {
            console.error(`Failed to fetch members for team ${team.id}:`, error)
            return {
              ...team,
              leaderIds: [],
              memberDetails: [],
            }
          }
        })
      )

      setTeamsWithMembers(teamsWithMembersData)
    }

    fetchTeamMembers()
  }, [schedule, isOpen, teams])

  if (!schedule) return null

  const scheduleDate = parseLocalDate(schedule.date)
  const scheduledTeams =
    teamsWithMembers.length > 0
      ? teamsWithMembers
      : teams
          .filter(team => schedule.teamIds.includes(team.id))
          .map(team => ({ ...team, leaderIds: [] }))

  const day = scheduleDate.getDate().toString()
  const month = scheduleDate.toLocaleDateString('pt-BR', { month: 'long' })
  const weekday = scheduleDate.toLocaleDateString('pt-BR', { weekday: 'long' })
  const time = service?.time
    ? formatTime(service.time)
    : scheduleDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })

  // Helper to get ministry name
  const getMinistryName = (ministryId: string) => {
    const ministry = ministries.find(m => m.id === ministryId)
    return ministry?.name ?? 'Ministério'
  }

  // Group teams by ministry (mocked/inferred) or just list them
  // For now, simple list

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Escala">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center gap-4 bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl">
          <div className="flex flex-col items-center justify-center bg-white dark:bg-dark-800 rounded-lg p-3 shadow-sm min-w-[70px]">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{day}</span>
            <span className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase">
              {month.slice(0, 3)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-dark-900 dark:text-dark-50">
              {service?.name || 'Culto'}
            </h3>
            <p className="text-dark-600 dark:text-dark-400 capitalize">
              {weekday} às {time}
            </p>
          </div>
        </div>

        {/* Teams List */}
        <div>
          <h4 className="text-sm font-semibold text-dark-900 dark:text-dark-50 mb-3 uppercase tracking-wider">
            Equipes Escaladas
          </h4>
          <div className="space-y-4">
            {scheduledTeams.length === 0 ? (
              <p className="text-dark-500 dark:text-dark-400 text-sm">Nenhuma equipe escalada.</p>
            ) : (
              scheduledTeams.map(team => (
                <div
                  key={team.id}
                  className="border border-dark-200 dark:border-dark-800 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 dark:bg-dark-900 p-3 border-b border-dark-200 dark:border-dark-800">
                    <h5 className="font-semibold text-dark-900 dark:text-dark-50">
                      <span className="text-primary-600 dark:text-primary-400 uppercase text-xs font-bold mr-2 tracking-wide">
                        {getMinistryName(team.ministryId)}
                      </span>
                      {team.name}
                    </h5>
                  </div>
                  <div className="p-3">
                    <ul className="space-y-2">
                      {team.memberIds.length === 0 ? (
                        <li className="text-xs text-dark-400 italic">Sem membros</li>
                      ) : (
                        people
                          .filter(p => team.memberIds.includes(p.id))
                          .sort((a, b) => {
                            // Líder primeiro
                            const teamWithMembers = teamsWithMembers.find(t => t.id === team.id)
                            const isALeader = teamWithMembers?.leaderIds?.includes(a.id) ?? false
                            const isBLeader = teamWithMembers?.leaderIds?.includes(b.id) ?? false
                            if (isALeader && !isBLeader) return -1
                            if (!isALeader && isBLeader) return 1
                            return 0
                          })
                          .map(member => {
                            const teamWithMembers = teamsWithMembers.find(t => t.id === team.id)
                            const isLeader =
                              teamWithMembers?.leaderIds?.includes(member.id) ?? false
                            return (
                              <li
                                key={member.id}
                                className={`text-sm flex items-center gap-2 ${
                                  isLeader
                                    ? 'font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1.5 rounded-md'
                                    : 'text-dark-700 dark:text-dark-300'
                                }`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    isLeader
                                      ? 'bg-primary-600 dark:bg-primary-400'
                                      : 'bg-primary-500'
                                  }`}
                                />
                                {member.name}
                                {isLeader && (
                                  <span className="ml-auto text-xs px-2 py-0.5 bg-primary-600 dark:bg-primary-500 text-white rounded-full font-medium">
                                    Líder
                                  </span>
                                )}
                              </li>
                            )
                          })
                      )}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
