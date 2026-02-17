import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useLanguage } from '../hooks/useLanguage'

export function CtaSection() {
  const { t } = useLanguage()
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.3 })

  return (
    <section className="relative overflow-hidden bg-dark-950 py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-600/15 blur-[120px]" />
      </div>

      <div
        ref={ref}
        className={cn(
          'relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8',
          'opacity-0 transition-all duration-700',
          isVisible && 'opacity-100 animate-reveal-up'
        )}
      >
        <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{t('cta.title')}</h2>
        <p className="mx-auto mt-6 max-w-2xl text-base text-dark-400 sm:text-lg">
          {t('cta.subtitle')}
        </p>

        <div className="mt-10">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-500 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-105 active:scale-95"
          >
            {t('cta.button')}
            <svg
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
