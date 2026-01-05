import { useState, useMemo, useCallback } from 'react'

interface UseListScreenOptions<T> {
  data: T[]
  searchFields?: (keyof T)[]
  searchTerm: string
  customFilter?: (item: T, searchTerm: string) => boolean
}

export function useListScreen<T extends { id: string }>({
  data,
  searchFields = [],
  searchTerm,
  customFilter,
}: UseListScreenOptions<T>) {
  const [refreshing, setRefreshing] = useState(false)

  const filteredData = useMemo(() => {
    if (!searchTerm && !customFilter) {
      return data
    }

    return data.filter(item => {
      if (customFilter) {
        return customFilter(item, searchTerm)
      }

      if (!searchTerm) {
        return true
      }

      const searchLower = searchTerm.toLowerCase()
      return searchFields.some(field => {
        const value = item[field]
        if (value === null || value === undefined) {
          return false
        }
        return String(value).toLowerCase().includes(searchLower)
      })
    })
  }, [data, searchTerm, searchFields, customFilter])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }, [])

  return {
    filteredData,
    refreshing,
    handleRefresh,
  }
}
