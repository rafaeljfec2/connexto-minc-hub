import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { churchesService } from './AuthContext'
import type { Option } from '@/components/Select/Select'
import { API_CONFIG } from '@/constants/config'

interface ChurchContextType {
  churches: Option[]
  selectedChurchId: string
  setSelectedChurchId: (id: string) => void
  isLoading: boolean
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined)

export function ChurchProvider({ children }: { children: ReactNode }) {
  const [churches, setChurches] = useState<Option[]>([])
  const [selectedChurchId, setSelectedChurchId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const isMockMode = API_CONFIG.MOCK_MODE

  useEffect(() => {
    async function loadChurches() {
      try {
        if (isMockMode) {
          const mockChurches = [
            { label: 'MINC - BH', value: '1' },
            { label: 'MINC - Santa Luzia', value: '2' },
          ]
          setChurches(mockChurches)
          setSelectedChurchId(mockChurches[0].value)
        } else {
          try {
            const data = await churchesService.getAll()
            const options = data.map(c => ({ label: c.name, value: c.id }))
            setChurches(options)
            if (options.length > 0) {
              setSelectedChurchId(options[0].value)
            }
          } catch (e) {
            console.log('Error fetching churches in context', e)
          }
        }
      } catch (error) {
        console.error('Failed to load churches:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadChurches()
  }, [isMockMode])

  return (
    <ChurchContext.Provider
      value={{
        churches,
        selectedChurchId,
        setSelectedChurchId,
        isLoading,
      }}
    >
      {children}
    </ChurchContext.Provider>
  )
}

export function useChurch() {
  const context = useContext(ChurchContext)
  if (context === undefined) {
    throw new Error('useChurch must be used within a ChurchProvider')
  }
  return context
}
