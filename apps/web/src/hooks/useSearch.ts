import { useState, useMemo, useCallback } from 'react'

interface UseSearchOptions<T> {
  items: T[]
  searchFields: (keyof T)[]
  onSearchChange?: (filteredItems: T[]) => void
}

interface UseSearchReturn<T> {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredItems: T[]
  clearSearch: () => void
}

export function useSearch<T extends Record<string, unknown>>({
  items,
  searchFields,
  onSearchChange,
}: UseSearchOptions<T>): UseSearchReturn<T> {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items
    }

    const searchLower = searchTerm.toLowerCase()
    const filtered = items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchLower)
      })
    )

    onSearchChange?.(filtered)
    return filtered
  }, [items, searchTerm, searchFields, onSearchChange])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    clearSearch,
  }
}
