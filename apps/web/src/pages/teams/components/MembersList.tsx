import { UserPlus } from 'lucide-react'
import { Team, Person } from '@minc-hub/shared/types'
import { LeaderCard } from './LeaderCard'
import { MemberItem } from './MemberItem'
import { Button } from '@/components/ui/Button'

interface MembersListProps {
  readonly team: Team | null
  readonly members: Person[]
  readonly leader: Person | null
  readonly isLoading: boolean
  readonly onMemberDelete: (member: Person) => void
  readonly onAddMember?: () => void
}

export function MembersList({
  team,
  members,
  leader,
  isLoading,
  onMemberDelete,
  onAddMember,
}: MembersListProps) {
  return (
    <>
      {/* Leadership Section */}
      {leader && <LeaderCard leader={leader} />}

      {/* Members List */}
      <section>
        <div className="flex justify-between items-center mb-3 ml-1">
          <h3 className="text-sm font-bold text-dark-900 dark:text-dark-50">Membros</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              {team?.memberIds?.length || 0} Pessoas
            </span>
            {onAddMember && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddMember}
                className="h-7 px-2 text-xs"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Adicionar
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-800 divide-y divide-gray-100 dark:divide-dark-800 overflow-hidden">
          {isLoading && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Carregando membros...
            </div>
          )}
          {!isLoading && members.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Nenhum membro encontrado.
            </div>
          )}
          {!isLoading &&
            members.length > 0 &&
            members.map(member => (
              <MemberItem key={member.id} member={member} onDelete={() => onMemberDelete(member)} />
            ))}
        </div>
      </section>
    </>
  )
}
