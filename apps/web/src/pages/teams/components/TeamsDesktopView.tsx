import type { Team } from '@minc-hub/shared/types'
import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { PlusIcon } from '@/components/icons'
import { Skeleton } from '@/components/ui/Skeleton'
import { TableCell } from '@/components/ui/Table'
import type { ViewMode } from '@/hooks/useViewMode'

interface TeamsDesktopViewProps {
  readonly teams: Team[]
  readonly isLoading: boolean
  readonly hasFilters: boolean
  readonly searchTerm: string
  readonly viewMode: ViewMode
  readonly onSearchChange: (value: string) => void
  readonly onViewModeChange: (mode: ViewMode) => void
  readonly onCreateClick: () => void
  readonly gridView: React.ReactNode
  readonly listViewHeaders: React.ReactNode[]
  readonly listViewRows: React.ReactNode[]
}

export function TeamsDesktopView({
  teams,
  isLoading,
  hasFilters,
  searchTerm,
  viewMode,
  onSearchChange,
  onViewModeChange,
  onCreateClick,
  gridView,
  listViewHeaders,
  listViewRows,
}: TeamsDesktopViewProps) {
  return (
    <div className="hidden lg:block">
      <CrudPageLayout
        title="Equipes"
        description="Gerencie equipes do Time Boas-Vindas"
        createButtonLabel="Nova Equipe"
        onCreateClick={onCreateClick}
        hasFilters={hasFilters}
        isEmpty={teams.length === 0 && !isLoading}
        emptyTitle={hasFilters ? 'Nenhuma equipe encontrada' : 'Nenhuma equipe cadastrada'}
        emptyDescription={
          hasFilters
            ? 'Tente ajustar os filtros para encontrar equipes'
            : 'Comece adicionando uma nova equipe'
        }
        createButtonIcon={<PlusIcon className="h-5 w-5 mr-2" />}
        filters={
          <CrudFilters
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Buscar por nome ou descrição..."
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
        }
        content={
          <CrudView
            viewMode={viewMode}
            gridView={gridView}
            listView={{
              headers: listViewHeaders,
              rows: listViewRows,
            }}
            isLoading={isLoading}
            skeletonCard={
              <div className="bg-white dark:bg-dark-900 rounded-lg p-6 shadow-sm border border-dark-200 dark:border-dark-800">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-dark-100 dark:border-dark-800">
                  <div className="flex -space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            }
            skeletonRow={
              <>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                </TableCell>
              </>
            }
          />
        }
      />
    </div>
  )
}
