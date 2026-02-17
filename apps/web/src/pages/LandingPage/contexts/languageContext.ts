import { createContext } from 'react'
import type { Language } from '../i18n/translations'

export interface LanguageContextType {
  readonly language: Language
  readonly toggleLanguage: () => void
  readonly t: (path: string) => string
  readonly tArray: (path: string) => readonly string[]
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)
