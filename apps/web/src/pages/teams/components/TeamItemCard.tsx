import { Team, Person } from '@minc-hub/shared/types'
import { usePeople } from '@/hooks/usePeople'
import { useState, useEffect, useMemo } from 'react'

interface TeamItemCardProps {
  readonly team: Team
  readonly ministryName?: string
  readonly onMenuClick?: (team: Team) => void
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

  // Ícone padrão
  return {
    icon: (
      <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    iconColor: 'text-primary-500',
  }
}

export function TeamItemCard({ team, ministryName, onMenuClick }: TeamItemCardProps) {
  const { getPersonById } = usePeople()
  const [leader, setLeader] = useState<Person | null>(null)
  const [members, setMembers] = useState<Person[]>([])

  const teamIcon = useMemo(() => getTeamIcon(ministryName, team.name), [ministryName, team.name])
  
  const totalMembers = team.memberIds?.length ?? 0
  // Ajustar cálculo de membros adicionais (mostra 3 avatares, não 4)
  const additionalMembers = totalMembers > 3 ? totalMembers - 3 : 0

  // Carregar líder
  useEffect(() => {
    if (team.leaderId) {
      getPersonById(team.leaderId)
        .then(person => {
          if (person) setLeader(person)
        })
        .catch(() => {
          // Ignore errors
        })
    }
  }, [team.leaderId, getPersonById])

  // Carregar membros (primeiros 3 para exibir avatares)
  useEffect(() => {
    if (team.memberIds && team.memberIds.length > 0) {
      Promise.all(
        team.memberIds
          .slice(0, 3)
          .map(memberId => getPersonById(memberId).catch(() => null))
      )
        .then(people => {
          setMembers(people.filter((p): p is Person => p !== null))
        })
    } else {
      setMembers([])
    }
  }, [team.memberIds, getPersonById])

  return (
    <div className="bg-white dark:bg-dark-900 rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Ícone - fundo branco com ícone colorido */}
        <div className="bg-white dark:bg-dark-800 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0 border border-dark-100 dark:border-dark-700">
          <div className={teamIcon.iconColor}>
            {teamIcon.icon}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-dark-900 dark:text-dark-50 mb-1">
                {team.name}
              </h3>
              {leader && (
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Liderado por {leader.name}
                </p>
              )}
            </div>

            {/* Menu de três pontos - no canto superior direito */}
            {onMenuClick && (
              <button
                onClick={() => onMenuClick(team)}
                className="p-1 text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 transition-colors flex-shrink-0 -mt-1"
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
            )}
          </div>

          {/* Avatares e membros */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Avatares dos membros - sobrepostos (máximo 3) */}
              {members.slice(0, 3).map((member, index) => (
                <div
                  key={member.id}
                  className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-dark-900 overflow-hidden"
                  style={{ marginLeft: index > 0 ? '-8px' : '0', zIndex: 10 - index }}
                >
                  <span className="text-xs">{member.name.charAt(0).toUpperCase()}</span>
                </div>
              ))}
              {/* Badge de membros adicionais - cinza claro como na imagem */}
              {additionalMembers > 0 && (
                <div className="w-8 h-8 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center text-dark-700 dark:text-dark-300 text-xs font-semibold border-2 border-white dark:border-dark-900" style={{ marginLeft: '-8px', zIndex: 1 }}>
                  +{additionalMembers}
                </div>
              )}
            </div>

            {/* Botão de total de membros - azul claro com texto azul escuro */}
            {totalMembers > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
                {totalMembers} {totalMembers === 1 ? 'Membro' : 'Membros'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
