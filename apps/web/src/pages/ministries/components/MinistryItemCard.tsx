import { Ministry } from '@minc-hub/shared/types'
import { useTeamsQuery } from '@/hooks/queries/useTeamsQuery'
import { useMemo } from 'react'

interface MinistryItemCardProps {
  readonly ministry: Ministry
  readonly onMenuClick?: (ministry: Ministry) => void
}

// Função para obter ícone e cor baseado no nome do ministério
function getMinistryIcon(ministryName: string) {
  const name = ministryName.toLowerCase()

  if (name.includes('louvor') || name.includes('adoração') || name.includes('música')) {
    return {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      ),
      color: 'bg-blue-500',
    }
  }

  if (name.includes('infantil') || name.includes('criança')) {
    return {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      color: 'bg-orange-500',
    }
  }

  if (name.includes('acolhimento') || name.includes('boas-vindas') || name.includes('recepção')) {
    return {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
      color: 'bg-green-500',
    }
  }

  if (name.includes('mídia') || name.includes('tecnologia') || name.includes('tech')) {
    return {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      ),
      color: 'bg-purple-500',
    }
  }

  // Ícone padrão
  return {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    color: 'bg-primary-500',
  }
}

export function MinistryItemCard({ ministry, onMenuClick }: MinistryItemCardProps) {
  const { teams } = useTeamsQuery()

  // Contar equipes deste ministério
  const ministryTeams = useMemo(() => {
    return teams.filter(team => team.ministryId === ministry.id && team.isActive)
  }, [teams, ministry.id])

  const totalTeams = ministryTeams.length
  const totalMembers = useMemo(() => {
    return ministryTeams.reduce((sum, team) => sum + (team.memberIds?.length ?? 0), 0)
  }, [ministryTeams])

  const ministryIcon = useMemo(() => getMinistryIcon(ministry.name), [ministry.name])

  return (
    <div className="bg-white dark:bg-dark-900 rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Ícone */}
        <div
          className={`${ministryIcon.color} rounded-lg w-12 h-12 flex items-center justify-center text-white flex-shrink-0`}
        >
          {ministryIcon.icon}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-dark-900 dark:text-dark-50 mb-1">
                {ministry.name}
              </h3>
              {ministry.description && (
                <p className="text-sm text-dark-500 dark:text-dark-400 line-clamp-1">
                  {ministry.description}
                </p>
              )}
            </div>

            {/* Menu de três pontos - no canto superior direito */}
            {onMenuClick && (
              <button
                onClick={() => onMenuClick(ministry)}
                className="p-1 text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 transition-colors flex-shrink-0 -mt-1"
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
            )}
          </div>

          {/* Estatísticas */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              {totalTeams > 0 && (
                <span className="text-sm text-dark-500 dark:text-dark-400">
                  {totalTeams} {totalTeams === 1 ? 'Equipe' : 'Equipes'}
                </span>
              )}
            </div>

            {/* Botão de total de membros - azul como na imagem */}
            {totalMembers > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-primary-500 text-white text-xs font-medium">
                {totalMembers} {totalMembers === 1 ? 'Membro' : 'Membros'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
