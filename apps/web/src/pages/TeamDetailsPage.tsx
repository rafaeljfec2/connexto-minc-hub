import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreVertical, Star, Check } from 'lucide-react'
import { useTeams } from '@/hooks/useTeams'
import { Team, Person } from '@minc-hub/shared/types'
import { createApiServices } from '@minc-hub/shared/services'
import { api } from '@/lib/api'
import { Avatar } from '@/components/ui/Avatar'

const apiServices = createApiServices(api)

export default function TeamDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTeamById } = useTeams()
  const [activeTab, setActiveTab] = useState<'membros' | 'tarefas' | 'atividades'>('membros')
  const [team, setTeam] = useState<Team | null>(null)

  // Members State
  const [members, setMembers] = useState<Person[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [hasFetchedMembers, setHasFetchedMembers] = useState(false)
  const [leader, setLeader] = useState<Person | null>(null)

  useEffect(() => {
    const loadTeam = async () => {
      if (id) {
        const data = await getTeamById(id)
        setTeam(data)
      }
    }
    loadTeam()
  }, [id, getTeamById])

  // Fetch members on demand
  useEffect(() => {
    const fetchMembers = async () => {
      if (activeTab === 'membros' && !hasFetchedMembers && team?.memberIds?.length) {
        try {
          setIsLoadingMembers(true)
          const allPeople = await apiServices.peopleService.getAll()
          const teamMembers = allPeople.filter(person => team.memberIds.includes(person.id))
          setMembers(teamMembers)

          if (team.leaderId) {
            const teamLeader = allPeople.find(person => person.id === team.leaderId)
            setLeader(teamLeader || null)
          }

          setHasFetchedMembers(true)
        } catch (error) {
          console.error('Failed to fetch members:', error)
        } finally {
          setIsLoadingMembers(false)
        }
      }
    }

    if (team) {
      fetchMembers()
    }
  }, [activeTab, team, hasFetchedMembers])

  // Fallback if team load fails or initially
  const teamName = team?.name || 'Equipe'
  const teamInitial = teamName.charAt(0).toUpperCase()

  return (
    <div className="fixed lg:static top-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:top-auto bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-auto left-0 right-0 lg:w-full lg:max-w-7xl lg:mx-auto lg:my-8 lg:h-[calc(100vh-8rem)] flex flex-col lg:flex-row overflow-hidden bg-transparent dark:bg-dark-950 lg:bg-white lg:dark:bg-dark-900 lg:rounded-2xl lg:shadow-xl lg:border lg:border-gray-200 lg:dark:border-dark-800">
      {/* Left Panel (Desktop: Sidebar / Mobile: Top) */}
      <div className="flex-shrink-0 lg:w-80 lg:border-r lg:border-gray-100 lg:dark:border-dark-800 lg:bg-gray-50/50 lg:dark:bg-dark-900/50 lg:overflow-y-auto">
        {/* Header with Back Button - Minimal Gap */}
        <div className="px-4 pt-4 lg:pt-6 pb-0 flex items-center shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-dark-900 dark:text-dark-50 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Main Info Card - Static Top */}
        <div className="flex flex-col items-center px-6 mb-6 lg:mb-8 shrink-0">
          {/* Avatar Ring */}
          <div className="relative mb-3 lg:mb-4 lg:mt-2">
            <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-full bg-white dark:bg-dark-900 p-1 shadow-sm ring-1 ring-black/5">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl lg:text-4xl font-bold">
                {teamInitial}
              </div>
            </div>
            <div className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 bg-green-500 rounded-full p-1 border-2 border-white dark:border-dark-950">
              <Check className="w-2.5 h-2.5 lg:w-4 lg:h-4 text-white" strokeWidth={4} />
            </div>
          </div>

          <h1 className="text-lg lg:text-xl font-bold text-dark-900 dark:text-dark-50 text-center mb-0.5">
            {teamName}
          </h1>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 text-center mb-3">
            Culto de Domingo • 19:00h
          </p>

          <div className="flex gap-2 flex-wrap justify-center">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-semibold uppercase tracking-wide">
              Música
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 text-[10px] font-semibold uppercase tracking-wide">
              {team?.memberIds?.length || 0} Membros
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel (Desktop: Content / Mobile: Bottom) */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-dark-900 lg:bg-transparent relative">
        {/* Tabs - Static */}
        <div className="px-4 mb-4 lg:mt-6 shrink-0 lg:px-8">
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
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-32 lg:pb-8 space-y-6">
          {activeTab === 'membros' && (
            <>
              {/* Leadership Section */}
              {leader && (
                <section>
                  <h3 className="text-sm font-bold text-dark-900 dark:text-dark-50 mb-3 ml-1">
                    Liderança
                  </h3>
                  <div className="bg-white dark:bg-dark-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar src={leader.avatar} name={leader.name} size="lg" />
                        <div className="absolute -bottom-1 -right-1 bg-primary-500 rounded-full p-1 border-2 border-white dark:border-dark-900">
                          <Star className="w-2.5 h-2.5 text-white fill-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-dark-900 dark:text-dark-50 text-sm">
                          {leader.name}
                        </h4>
                        <p className="text-primary-600 dark:text-primary-400 text-xs font-medium">
                          Líder da Equipe
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </section>
              )}

              {/* Members List */}
              <section>
                <div className="flex justify-between items-center mb-3 ml-1">
                  <h3 className="text-sm font-bold text-dark-900 dark:text-dark-50">Membros</h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    {team?.memberIds?.length || 0} Pessoas
                  </span>
                </div>

                <div className="bg-white dark:bg-dark-900 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-800 divide-y divide-gray-100 dark:divide-dark-800 overflow-hidden">
                  {isLoadingMembers && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Carregando membros...
                    </div>
                  )}
                  {!isLoadingMembers && members.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Nenhum membro encontrado.
                    </div>
                  )}
                  {!isLoadingMembers &&
                    members.length > 0 &&
                    members.map(member => (
                      <div
                        key={member.id}
                        className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar src={member.avatar} name={member.name} size="md" />
                          <div>
                            <h4 className="text-sm font-semibold text-dark-900 dark:text-dark-50">
                              {member.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Membro</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-500" strokeWidth={3} />
                          </div>
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
      </div>
    </div>
  )
}
