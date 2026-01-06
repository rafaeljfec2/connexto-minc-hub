import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { Church } from '@minc-hub/shared/types'
import { useChurches } from '@/hooks/useChurches'

interface ChurchContextType {
  selectedChurch: Church | null
  setSelectedChurch: (church: Church | null) => void
  selectChurchById: (churchId: string) => void
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined)

interface ChurchProviderProps {
  readonly children: ReactNode
}

const SELECTED_CHURCH_STORAGE_KEY = 'selected_church_id'

export function ChurchProvider({ children }: ChurchProviderProps) {
  const { churches } = useChurches()
  const [selectedChurch, setSelectedChurchState] = useState<Church | null>(null)

  // Restore selected church from localStorage on mount or when churches are loaded
  useEffect(() => {
    // Only proceed if we have churches and no church is selected
    if (churches.length > 0 && !selectedChurch) {
      const savedChurchId = localStorage.getItem(SELECTED_CHURCH_STORAGE_KEY)
      if (savedChurchId) {
        const church = churches.find(c => c.id === savedChurchId)
        if (church) {
          console.log('Restoring saved church:', church.name)
          setSelectedChurchState(church)
          return
        }
      }
      // If no saved church or saved church not found, select first church
      if (churches[0]) {
        console.log('Auto-selecting first church:', churches[0].name)
        setSelectedChurchState(churches[0])
        localStorage.setItem(SELECTED_CHURCH_STORAGE_KEY, churches[0].id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [churches, selectedChurch?.id]) // Depend on churches array, not just length

  const setSelectedChurch = useCallback((church: Church | null) => {
    setSelectedChurchState(church)
    if (church) {
      localStorage.setItem(SELECTED_CHURCH_STORAGE_KEY, church.id)
    } else {
      localStorage.removeItem(SELECTED_CHURCH_STORAGE_KEY)
    }
  }, [])

  const selectChurchById = useCallback(
    (churchId: string) => {
      const church = churches.find(c => c.id === churchId)
      if (church) {
        setSelectedChurch(church)
      }
    },
    [churches, setSelectedChurch]
  )

  return (
    <ChurchContext.Provider
      value={{
        selectedChurch,
        setSelectedChurch,
        selectChurchById,
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
