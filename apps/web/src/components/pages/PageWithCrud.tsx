import { ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { usePagination } from '@/hooks/usePagination'
import { useSearch } from '@/hooks/useSearch'
import { ITEMS_PER_PAGE } from '@/lib/constants'

interface PageWithCrudProps<T extends { id: string }> {
  title: string
  description?: string
  createButtonLabel: string
  items: T[]
  searchFields: (keyof T)[]
  searchPlaceholder?: string
  emptyMessage?: string
  emptySearchMessage?: string
  tableContent: (paginatedItems: T[]) => ReactNode
  searchCard?: ReactNode
  onCreateClick: () => void
}

export function PageWithCrud<T extends { id: string }>({
  title,
  description,
  createButtonLabel,
  items,
  searchFields,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum item cadastrado',
  emptySearchMessage = 'Nenhum item encontrado',
  tableContent,
  searchCard,
  onCreateClick,
}: PageWithCrudProps<T>) {
  const { searchTerm, setSearchTerm, filteredItems, clearSearch } = useSearch({
    items,
    searchFields,
  })

  const { currentPage, totalPages, paginatedItems, setCurrentPage, totalItems } = usePagination({
    items: filteredItems,
    itemsPerPage: ITEMS_PER_PAGE,
  })

  const hasSearch = searchTerm.length > 0

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={title}
        description={description}
        action={
          <Button variant="primary" size="md" onClick={onCreateClick}>
            {createButtonLabel}
          </Button>
        }
      />

      {searchCard ?? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <SearchInput
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              onClear={() => {
                clearSearch()
                setCurrentPage(1)
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {title} ({totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-sm text-dark-400 text-center py-8">
              {hasSearch ? emptySearchMessage : emptyMessage}
            </div>
          ) : (
            <>
              {tableContent(paginatedItems)}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={totalItems}
              />
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
