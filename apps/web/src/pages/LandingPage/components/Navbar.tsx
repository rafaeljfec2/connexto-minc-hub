import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandText } from '@/components/ui/BrandText'
import { cn } from '@/lib/utils'
import { useLanguage } from '../hooks/useLanguage'

const NAV_LINKS = ['features', 'howItWorks', 'pricing', 'faq'] as const

const SECTION_IDS: Record<string, string> = {
  features: 'features',
  howItWorks: 'how-it-works',
  pricing: 'pricing',
  faq: 'faq',
}

export function Navbar() {
  const { t, language, toggleLanguage } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-dark-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandText size="lg" />

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(key => (
            <button
              key={key}
              type="button"
              onClick={() => scrollToSection(SECTION_IDS[key])}
              className="text-sm font-medium text-dark-400 transition-colors hover:text-white"
            >
              {t(`nav.${key}`)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-dark-300 transition-all hover:border-white/20 hover:text-white"
          >
            {language === 'pt-BR' ? 'EN' : 'PT'}
          </button>

          <Link
            to="/login"
            className="hidden rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-500 hover:scale-105 active:scale-95 sm:inline-flex"
          >
            {t('nav.cta')}
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-dark-400 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden border-t border-white/5 bg-dark-950/95 backdrop-blur-xl transition-all duration-300 md:hidden',
          isMobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="space-y-1 px-4 py-4">
          {NAV_LINKS.map(key => (
            <button
              key={key}
              type="button"
              onClick={() => scrollToSection(SECTION_IDS[key])}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-dark-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              {t(`nav.${key}`)}
            </button>
          ))}
          <Link
            to="/login"
            className="mt-2 block w-full rounded-lg bg-primary-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-primary-500"
          >
            {t('nav.cta')}
          </Link>
        </div>
      </div>
    </nav>
  )
}
