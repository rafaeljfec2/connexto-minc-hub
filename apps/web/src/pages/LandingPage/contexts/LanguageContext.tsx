/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { type Language, getTranslation } from '../i18n/translations'

export interface LanguageContextType {
  readonly language: Language
  readonly toggleLanguage: () => void
  readonly t: (path: string) => string
  readonly tArray: (path: string) => readonly string[]
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  readonly children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const browserLang = navigator.language
    return browserLang.startsWith('pt') ? 'pt-BR' : 'en'
  })

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'pt-BR' ? 'en' : 'pt-BR'))
  }, [])

  const t = useCallback(
    (path: string): string => {
      const result = getTranslation(language, path)
      return Array.isArray(result) ? result.join(', ') : String(result)
    },
    [language]
  )

  const tArray = useCallback(
    (path: string): readonly string[] => {
      const result = getTranslation(language, path)
      return Array.isArray(result) ? result : [String(result)]
    },
    [language]
  )

  const value = useMemo(
    () => ({ language, toggleLanguage, t, tArray }),
    [language, toggleLanguage, t, tArray]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
