import { ReactNode } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table'
import { EmptyState } from './EmptyState'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => ReactNode
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
  emptySearchMessage?: string
  hasSearch?: boolean
  actions?: (item: T) => ReactNode
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  emptyMessage = 'Nenhum item cadastrado',
  emptySearchMessage = 'Nenhum item encontrado',
  hasSearch = false,
  actions,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <EmptyState title={hasSearch ? emptySearchMessage : emptyMessage} />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map(column => (
            <TableHead
              key={String(column.key)}
              className={column.align === 'right' ? 'text-right' : ''}
            >
              {column.label}
            </TableHead>
          ))}
          {actions && <TableHead className="text-right">Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(item => (
          <TableRow key={item.id}>
            {columns.map(column => (
              <TableCell
                key={String(column.key)}
                className={column.align === 'right' ? 'text-right' : ''}
              >
                {column.render ? column.render(item) : String(item[column.key as keyof T] ?? '-')}
              </TableCell>
            ))}
            {actions && (
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">{actions(item)}</div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
