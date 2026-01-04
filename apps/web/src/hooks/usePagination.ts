import { useState, useMemo } from 'react'

interface UsePaginationOptions<T> {
  items: T[]
  itemsPerPage?: number
}

interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  paginatedItems: T[]
  setCurrentPage: (page: number) => void
  totalItems: number
}

export function usePagination<T>({
  items,
  itemsPerPage = 10,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / itemsPerPage)

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, itemsPerPage])

  return {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
    totalItems: items.length,
  }
}
