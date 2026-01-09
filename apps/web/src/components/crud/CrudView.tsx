import { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead } from '@/components/ui/Table'

type ViewMode = 'grid' | 'list'

interface CrudViewProps {
  readonly viewMode: ViewMode
  readonly gridView: ReactNode
  readonly listView: {
    readonly headers: ReactNode[]
    readonly rows: ReactNode[]
  }
  readonly isLoading?: boolean
  readonly skeletonCard?: ReactNode
  readonly skeletonRow?: ReactNode
}

export function CrudView({
  viewMode,
  gridView,
  listView,
  isLoading = false,
  skeletonCard,
  skeletonRow,
}: CrudViewProps) {
  if (isLoading) {
    const itemCount = 8

    return (
      <>
        {/* Mobile: sempre mostra cards (grid) */}
        <div className="block md:hidden">
          <div className="grid grid-cols-1 gap-6">
            {Array.from({ length: itemCount }).map((_, i) => (
              <div key={i}>{skeletonCard}</div>
            ))}
          </div>
        </div>

        {/* Web: respeita o viewMode escolhido */}
        <div className="hidden md:block">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: itemCount }).map((_, i) => (
                <div key={i}>{skeletonCard}</div>
              ))}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    {listView.headers.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: itemCount }).map((_, i) => (
                    <TableRow key={i}>{skeletonRow}</TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile: sempre mostra cards (grid) */}
      <div className="block md:hidden">{gridView}</div>

      {/* Web: respeita o viewMode escolhido */}
      <div className="hidden md:block">
        {viewMode === 'grid' ? (
          gridView
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  {listView.headers.map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>{listView.rows}</TableBody>
            </Table>
          </Card>
        )}
      </div>
    </>
  )
}
