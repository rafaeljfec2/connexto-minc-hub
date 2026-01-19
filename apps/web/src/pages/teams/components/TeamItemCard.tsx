import { UserPlus } from 'lucide-react'
import { Team, Person } from '@minc-hub/shared/types'
import { useState, useEffect, useMemo } from 'react'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { Avatar } from '@/components/ui/Avatar'
import { ItemMenuDropdown } from '@/components/ui/ItemMenuDropdown'

interface TeamItemCardProps {
  readonly team: Team
  readonly ministryName?: string
  readonly onEdit?: (team: Team) => void
  readonly onDelete?: (team: Team) => void
  readonly onAddMember?: (team: Team) => void
  readonly onClick?: (team: Team) => void
}

// Função para obter ícone e cor baseado no nome do ministério/equipe
function getTeamIcon(ministryName?: string, teamName?: string) {
  const name = (ministryName ?? teamName ?? '').toLowerCase()

  if (name.includes('louvor') || name.includes('adoração') || name.includes('música')) {
    return {
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      ),
      iconColor: 'text-blue-500',
    }
  }

  if (name.includes('infantil') || name.includes('criança')) {
    return {
      icon: (
        <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      iconColor: 'text-orange-500',
    }
  }

  if (name.includes('acolhimento') || name.includes('boas-vindas') || name.includes('recepção')) {
    return {
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
      iconColor: 'text-green-500',
    }
  }

  if (name.includes('mídia') || name.includes('tecnologia') || name.includes('tech')) {
    return {
      icon: (
        <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      ),
      iconColor: 'text-purple-500',
    }
  }

  // Ícone padrão - duas pessoas (laranja)
  return {
    icon: (
      <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    iconColor: 'text-orange-500',
  }
}

const apiServices = createApiServices(api)

export function TeamItemCard({
  team,
  ministryName,
  onEdit,
  onDelete,
  onAddMember,
  onClick,
}: TeamItemCardProps) {
  const [leaders, setLeaders] = useState<Person[]>([])
  const [members, setMembers] = useState<Person[]>([])
  const [totalMembers, setTotalMembers] = useState(0)

  const teamIcon = useMemo(() => getTeamIcon(ministryName, team.name), [ministryName, team.name])
  const additionalMembers = totalMembers > 3 ? totalMembers - 3 : 0
  const leader = leaders[0] || null

  // Carregar líderes e membros
  useEffect(() => {
    let cancelled = false

    const loadMembers = async () => {
      try {
        const teamMembers = await apiServices.teamsService.getMembers(team.id)

        if (cancelled) return

        const allMembers = teamMembers
          .map(tm => tm.person)
          .filter((p): p is Person => p !== undefined && p !== null)

        const teamLeaders = teamMembers
          .filter(tm => tm.role === 'lider_de_equipe')
          .map(tm => tm.person)
          .filter((p): p is Person => p !== undefined && p !== null)

        setTotalMembers(allMembers.length)
        setMembers(allMembers.slice(0, 3))
        setLeaders(teamLeaders)
      } catch (error) {
        if (cancelled) return
        console.error('Error loading team members:', error)
        setMembers([])
        setLeaders([])
        setTotalMembers(0)
      }
    }

    loadMembers()

    return () => {
      cancelled = true
    }
  }, [team.id])

  if (!team) {
    return null
  }

  return (
    <div
      className={`bg-gray-100 dark:bg-dark-800 rounded-lg p-4 shadow-sm ${onClick ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors' : ''}`}
      onClick={() => onClick?.(team)}
    >
      <div className="flex items-start gap-3">
        {/* Ícone - quadrado branco com ícone colorido */}
        <div className="bg-white dark:bg-dark-900 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
          <div className={teamIcon.iconColor}>{teamIcon.icon}</div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Título, subtítulo e menu */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="text-base font-bold text-dark-900 dark:text-dark-50 mb-1">
                {team.name || 'Sem nome'}
              </h3>
              {leader && (
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Liderado por {leader.name}
                </p>
              )}
            </div>

            {/* Menu de três pontos verticais - canto superior direito */}
            {(onEdit || onDelete || onAddMember) && (
              <div onClick={e => e.stopPropagation()}>
                <ItemMenuDropdown
                  onEdit={onEdit ? () => onEdit(team) : undefined}
                  onDelete={onDelete ? () => onDelete(team) : undefined}
                  menuItems={
                    onAddMember
                      ? [
                          {
                            label: 'Adicionar Membro',
                            onClick: () => onAddMember(team),
                            icon: <UserPlus className="w-4 h-4" />,
                          },
                        ]
                      : []
                  }
                />
              </div>
            )}
          </div>

          {/* Avatares e botão de membros */}
          <div className="flex items-center justify-between">
            {/* Avatares sobrepostos - 3 avatares circulares */}
            <div className="flex items-center min-h-[32px]">
              {members.length > 0 && (
                <>
                  {members.slice(0, 3).map((member, index) => (
                    <div
                      key={member.id}
                      className="relative"
                      style={{ marginLeft: index > 0 ? '-8px' : '0', zIndex: 10 - index }}
                    >
                      <Avatar
                        src={member.avatar}
                        name={member.name}
                        size="sm"
                        className="border-2 border-gray-100 dark:border-dark-800"
                      />
                    </div>
                  ))}
                  {/* Badge "+X" - círculo cinza claro com texto branco */}
                  {additionalMembers > 0 && (
                    <div
                      className="w-8 h-8 rounded-full bg-gray-300 dark:bg-dark-700 flex items-center justify-center text-white text-xs font-semibold border-2 border-gray-100 dark:border-dark-800"
                      style={{ marginLeft: '-8px', zIndex: 1 }}
                    >
                      +{additionalMembers}
                    </div>
                  )}
                </>
              )}
              {members.length === 0 && totalMembers > 0 && (
                <span className="text-xs text-dark-400 dark:text-dark-500">
                  Carregando membros...
                </span>
              )}
            </div>

            {/* Botão de total de membros - azul claro com texto azul escuro, formato pill */}
            {totalMembers > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium whitespace-nowrap">
                {totalMembers} {totalMembers === 1 ? 'Membro' : 'Membros'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
