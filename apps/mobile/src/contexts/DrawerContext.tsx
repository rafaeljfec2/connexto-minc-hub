import React, { createContext, useContext, useState, ReactNode } from 'react'
import { DrawerMenu } from '@/components/DrawerMenu'

interface DrawerContextData {
  openDrawer: () => void
  closeDrawer: () => void
  isDrawerOpen: boolean
}

const DrawerContext = createContext<DrawerContextData>({} as DrawerContextData)

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const openDrawer = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)

  const contextValue = React.useMemo(
    () => ({ openDrawer, closeDrawer, isDrawerOpen }),
    [isDrawerOpen]
  )

  return (
    <DrawerContext.Provider value={contextValue}>
      {children}
      <DrawerMenu visible={isDrawerOpen} onClose={closeDrawer} />
    </DrawerContext.Provider>
  )
}

export function useDrawer() {
  const context = useContext(DrawerContext)
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider')
  }
  return context
}
