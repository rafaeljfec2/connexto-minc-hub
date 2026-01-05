import { useState, useEffect } from 'react'

type ViewMode = 'grid' | 'list'

interface UseViewModeOptions {
  readonly storageKey: string
  readonly defaultMode?: ViewMode
}

export function useViewMode({ storageKey, defaultMode = 'grid' }: UseViewModeOptions) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const isWeb = window.innerWidth >= 768
      if (isWeb) {
        const saved = localStorage.getItem(storageKey) as ViewMode | null
        return saved === 'list' || saved === 'grid' ? saved : defaultMode
      }
      return 'grid'
    }
    return defaultMode
  })

  useEffect(() => {
    const handleResize = () => {
      const isWeb = window.innerWidth >= 768
      if (!isWeb) {
        setViewMode('grid')
      } else {
        const saved = localStorage.getItem(storageKey) as ViewMode | null
        if (saved === 'list' || saved === 'grid') {
          setViewMode(saved)
        } else {
          setViewMode(defaultMode)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [storageKey, defaultMode])

  const handleViewModeChange = (mode: ViewMode) => {
    if (typeof window !== 'undefined') {
      const isWeb = window.innerWidth >= 768
      if (isWeb) {
        setViewMode(mode)
        localStorage.setItem(storageKey, mode)
      }
    }
  }

  return { viewMode, setViewMode: handleViewModeChange }
}
