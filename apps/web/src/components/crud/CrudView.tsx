import { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead } from '@/components/ui/Table'

type ViewMode = 'grid' | 'list'

interface CrudViewProps {
  readonly viewMode: ViewMode
  readonly gridView: ReactNode
  readonly listView: {
    readonly headers: string[]
    readonly rows: ReactNode[]
  }
}

export function CrudView({ viewMode, gridView, listView }: CrudViewProps) {
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
