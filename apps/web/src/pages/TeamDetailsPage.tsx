import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreVertical, Check, Star, UserPlus } from 'lucide-react'
import { useTeams } from '@/hooks/useTeams'
import { Team } from '@minc-hub/shared/types'

// Mock Data for Visual Match
const MOCK_MEMBERS = {
  leadership: [
    {
      id: '1',
      name: 'Carlos Silva',
      role: 'Ministro de Louvor',
      avatar: null, // Placeholder
      color: 'bg-blue-100 text-blue-600',
      isLeader: true,
    },
  ],
  members: [
    {
      id: '2',
      name: 'Ana Clara',
      role: 'Vocal Principal',
      avatar: null,
      status: 'active',
      notification: 0,
    },
    {
      id: '3',
      name: 'João Pedro',
      role: 'Guitarra',
      avatar: null,
      status: 'none',
      notification: 0,
    },
    {
      id: '4',
      name: 'Sarah Mendes',
      role: 'Teclado',
      avatar: null,
      status: 'none',
      notification: 0,
    },
    {
      id: '5',
      name: 'Marcos Lima',
      role: 'Bateria',
      avatar: null,
      status: 'none',
      notification: 1,
    },
    {
      id: '6',
      name: 'Rafael Barbosa',
      role: 'Baixo',
      avatar: null,
      status: 'none',
      notification: 0,
    },
  ],
}

export default function TeamDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTeamById } = useTeams()
  const [team, setTeam] = useState<Team | null>(null)
  const [activeTab, setActiveTab] = useState<'membros' | 'tarefas' | 'atividades'>('membros')

  useEffect(() => {
    if (id) {
      getTeamById(id).then(setTeam).catch(console.error)
    }
  }, [id, getTeamById])

  // Fallback if team load fails or initially
  const teamName = team?.name || 'Equipe'
  const teamInitial = teamName.charAt(0).toUpperCase()

  return (
    <div className="fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 flex flex-col overflow-hidden bg-gray-50 dark:bg-dark-950">
      {/* Header with Back Button - Minimal Gap */}
      <div className="px-4 pt-4 pb-0 flex items-center shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-dark-900 dark:text-dark-50 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Main Info Card - Static Top */}
      <div className="flex flex-col items-center px-6 mb-6 shrink-0">
        {/* Avatar Ring */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-white dark:bg-dark-900 p-1 shadow-sm ring-1 ring-black/5">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-4 FAB0 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
              {teamInitial}
            </div>
          </div>
          <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-dark-950">
            <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
          </div>
        </div>

        <h1 className="text-lg font-bold text-dark-900 dark:text-dark-50 text-center mb-0.5">
          {teamName}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
          Culto de Domingo • 19:00h
        </p>

        <div className="flex gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-semibold uppercase tracking-wide">
            Música
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 text-[10px] font-semibold uppercase tracking-wide">
            12 Membros
          </span>
        </div>
      </div>

      {/* Tabs - Static */}
      <div className="px-4 mb-4 shrink-0">
        <div className="bg-gray-100 dark:bg-dark-900 p-1 rounded-xl flex">
          {(['membros', 'tarefas', 'atividades'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-6">
        {activeTab === 'membros' && (
          <>
            {/* Leadership Section */}
            <section>
              <h3 className="text-sm font-bold text-dark-900 dark:text-dark-50 mb-3 ml-1">
                Liderança
              </h3>
              <div className="bg-white dark:bg-dark-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-dark-800 flex items-center justify-center overflow-hidden">
                      <img
                        src="https://i.pravatar.cc/150?u=Leadership"
                        alt="Leader"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-primary-500 rounded-full p-1 border-2 border-white dark:border-dark-900">
                      <Star className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-dark-900 dark:text-dark-50 text-sm">
                      Carlos Silva
                    </h4>
                    <p className="text-primary-600 dark:text-primary-400 text-xs font-medium">
                      Ministro de Louvor
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </section>

            {/* Members List */}
            <section>
              <div className="flex justify-between items-center mb-3 ml-1">
                <h3 className="text-sm font-bold text-dark-900 dark:text-dark-50">Membros</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  {MOCK_MEMBERS.members.length} Pessoas
                </span>
              </div>

              <div className="bg-white dark:bg-dark-900 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-800 divide-y divide-gray-100 dark:divide-dark-800 overflow-hidden">
                {MOCK_MEMBERS.members.map(member => (
                  <div
                    key={member.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-800 flex-shrink-0">
                        <img
                          src={`https://i.pravatar.cc/150?u=${member.id}`}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-dark-900 dark:text-dark-50">
                          {member.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {member.status === 'active' && (
                        <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-500" strokeWidth={3} />
                        </div>
                      )}
                      {member.notification > 0 && (
                        <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center">
                          {member.notification}
                        </div>
                      )}
                      <button className="text-gray-400">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* FAB */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-600/30 transition-transform active:scale-95 z-50">
        <UserPlus className="w-6 h-6" />
      </button>
    </div>
  )
}
