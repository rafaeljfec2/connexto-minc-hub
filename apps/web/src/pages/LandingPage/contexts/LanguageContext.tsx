/* eslint-disable react-refresh/only-export-components */
import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { type Language, getTranslation } from '../i18n/translations'
import { LanguageContext } from './languageContext'

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
