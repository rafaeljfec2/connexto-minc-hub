import { useState } from 'react'

export interface SortConfig<T> {
  key: keyof T | string
  direction: 'asc' | 'desc'
}

interface UseSortOptions<T> {
  defaultKey?: keyof T | string
  defaultDirection?: 'asc' | 'desc'
}

export function useSort<T>(options: UseSortOptions<T> = {}) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: options.defaultKey ?? '',
    direction: options.defaultDirection ?? 'asc',
  })

  function handleSort(key: keyof T | string) {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  function sortData<D>(
    data: D[],
    extractor:
      | ((item: D, key: keyof T | string) => string | number | null | undefined)
      | Record<string, (item: D) => string | number | null | undefined>
  ) {
    if (!sortConfig.key) return data

    const getVal = (item: D, key: string) => {
      if (typeof extractor === 'function') {
        return extractor(item, key)
      }
      const mapper = extractor[key]
      return mapper ? mapper(item) : null
    }

    return [...data].sort((a, b) => {
      const key = sortConfig.key as string
      const valueA = getVal(a, key)
      const valueB = getVal(b, key)

      if (valueA === valueB) return 0
      if (valueA === null || valueA === undefined) return 1
      if (valueB === null || valueB === undefined) return -1

      if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  return {
    sortConfig,
    handleSort,
    sortData,
  }
}
