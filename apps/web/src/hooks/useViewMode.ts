import { useState, useEffect } from 'react'

export type ViewMode = 'grid' | 'list'

interface UseViewModeOptions {
  readonly storageKey: string
  readonly defaultMode?: ViewMode
}

export function useViewMode({ storageKey, defaultMode = 'list' }: UseViewModeOptions) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (globalThis.window !== undefined) {
      const isWeb = globalThis.window.innerWidth >= 768
      if (isWeb) {
        const saved = globalThis.window.localStorage.getItem(storageKey) as ViewMode | null
        if (saved === 'list' || saved === 'grid') {
          return saved
        }
        return defaultMode
      }
      return 'grid'
    }
    return defaultMode
  })

  useEffect(() => {
    if (globalThis.window !== undefined) {
      const isWeb = globalThis.window.innerWidth >= 768
      if (isWeb) {
        const saved = globalThis.window.localStorage.getItem(storageKey) as ViewMode | null
        if (saved !== 'list' && saved !== 'grid') {
          setViewMode(defaultMode)
          globalThis.window.localStorage.setItem(storageKey, defaultMode)
        }
      }
    }
  }, [storageKey, defaultMode])

  useEffect(() => {
    const handleResize = () => {
      if (globalThis.window === undefined) return

      const isWeb = globalThis.window.innerWidth >= 768
      if (isWeb) {
        const saved = globalThis.window.localStorage.getItem(storageKey) as ViewMode | null
        if (saved === 'list' || saved === 'grid') {
          setViewMode(saved)
        } else {
          setViewMode(defaultMode)
          globalThis.window.localStorage.setItem(storageKey, defaultMode)
        }
      } else {
        setViewMode('grid')
      }
    }

    globalThis.window.addEventListener('resize', handleResize)
    return () => globalThis.window.removeEventListener('resize', handleResize)
  }, [storageKey, defaultMode])

  const handleViewModeChange = (mode: ViewMode) => {
    if (globalThis.window !== undefined) {
      const isWeb = globalThis.window.innerWidth >= 768
      if (isWeb) {
        setViewMode(mode)
        globalThis.window.localStorage.setItem(storageKey, mode)
      }
    }
  }

  return { viewMode, setViewMode: handleViewModeChange }
}
