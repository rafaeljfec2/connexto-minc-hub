import { useState, useEffect } from 'react'

type ViewMode = 'grid' | 'list'

interface UseViewModeOptions {
  readonly storageKey: string
  readonly defaultMode?: ViewMode
}

export function useViewMode({ storageKey, defaultMode = 'grid' }: UseViewModeOptions) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 768) {
        const saved = localStorage.getItem(storageKey) as ViewMode | null
        return saved === 'list' || saved === 'grid' ? saved : defaultMode
      }
      return 'grid'
    }
    return defaultMode
  })

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid')
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      localStorage.setItem(storageKey, mode)
    }
  }

  return { viewMode, setViewMode: handleViewModeChange }
}
