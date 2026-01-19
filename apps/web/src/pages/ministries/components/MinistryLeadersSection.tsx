import { UserPlus, Star } from 'lucide-react'
import { Person } from '@minc-hub/shared/types'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ItemMenuDropdown, MenuItem } from '@/components/ui/ItemMenuDropdown'

interface MinistryLeadersSectionProps {
  readonly leaders: Person[]
  readonly isLoading: boolean
  readonly onAddLeader?: () => void
  readonly onRemoveLeader?: (leader: Person) => void
}

export function MinistryLeadersSection({
  leaders,
  isLoading,
  onAddLeader,
  onRemoveLeader,
}: MinistryLeadersSectionProps) {
  return (
    <section>
      <div className="flex justify-between items-center mb-3 ml-1">
        <h3 className="text-sm font-bold text-dark-900 dark:text-dark-50">Líderes do Ministério</h3>
        {onAddLeader && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddLeader}
            className="h-7 px-2 text-xs"
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Adicionar
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-800 divide-y divide-gray-100 dark:divide-dark-800 overflow-hidden">
        {isLoading && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Carregando líderes...
          </div>
        )}
        {!isLoading && leaders.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Nenhum líder encontrado.
          </div>
        )}
        {!isLoading &&
          leaders.length > 0 &&
          leaders.map(leader => {
            const menuItems: MenuItem[] = []
            if (onRemoveLeader) {
              menuItems.push({
                label: 'Remover Liderança',
                onClick: () => onRemoveLeader(leader),
                icon: <Star className="w-4 h-4" />,
              })
            }

            return (
              <div
                key={leader.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <Avatar src={leader.avatar} name={leader.name} size="md" />
                    <div className="absolute -bottom-1 -right-1 bg-primary-500 rounded-full p-1 border-2 border-white dark:border-dark-900">
                      <Star className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-dark-900 dark:text-dark-50 truncate">
                      {leader.name}
                    </h4>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                      Líder de Ministério
                    </p>
                  </div>
                </div>
                {menuItems.length > 0 && <ItemMenuDropdown menuItems={menuItems} />}
              </div>
            )
          })}
      </div>
    </section>
  )
}
