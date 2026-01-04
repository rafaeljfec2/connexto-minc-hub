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
  if (viewMode === 'grid') {
    return <div className="block">{gridView}</div>
  }

  return (
    <>
      <div className="block md:hidden">{gridView}</div>
      <div className="hidden md:block">
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
      </div>
    </>
  )
}
