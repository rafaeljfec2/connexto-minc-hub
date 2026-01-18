import { Check } from 'lucide-react'
import { Team } from '@minc-hub/shared/types'

interface TeamProfileProps {
  readonly team: Team | null
}

export function TeamProfile({ team }: TeamProfileProps) {
  const teamName = team?.name || 'Equipe'
  const teamInitial = teamName.charAt(0).toUpperCase()

  return (
    <div className="flex flex-col items-center px-6 mb-4 lg:mb-6 shrink-0">
      {/* Avatar Ring */}
      <div className="relative mb-2 lg:mb-3">
        <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-white dark:bg-dark-800 p-1 shadow-sm ring-1 ring-gray-200 dark:ring-dark-700">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl lg:text-3xl font-bold">
            {teamInitial}
          </div>
        </div>
        <div className="absolute bottom-0 right-0 lg:bottom-1 lg:right-1 bg-green-500 rounded-full p-0.5 lg:p-1 border-2 border-white dark:border-dark-800">
          <Check className="w-2 h-2 lg:w-3 lg:h-3 text-white" strokeWidth={4} />
        </div>
      </div>

      <h1 className="text-base lg:text-lg font-bold text-dark-900 dark:text-dark-50 text-center mb-0.5">
        {teamName}
      </h1>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
        Culto de Domingo • 19:00h
      </p>

      <div className="flex gap-1.5 flex-wrap justify-center">
        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-semibold uppercase tracking-wide">
          Música
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 text-[10px] font-semibold uppercase tracking-wide">
          {team?.memberIds?.length || 0} Membros
        </span>
      </div>
    </div>
  )
}
