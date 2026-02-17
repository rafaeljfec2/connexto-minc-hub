import { cn } from '@/lib/utils'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useLanguage } from '../hooks/useLanguage'

const FEATURE_KEYS = [
  'teams',
  'schedules',
  'communication',
  'checkin',
  'multiChurch',
  'analytics',
] as const

const FEATURE_ICONS: Record<string, JSX.Element> = {
  teams: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  schedules: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  communication: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  checkin: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
      />
    </svg>
  ),
  multiChurch: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  analytics: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
}

interface FeatureCardProps {
  readonly featureKey: string
  readonly index: number
}

function FeatureCard({ featureKey, index }: FeatureCardProps) {
  const { t } = useLanguage()
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 })

  return (
    <div
      ref={ref}
      className={cn(
        'group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-500 hover:border-primary-500/30 hover:bg-white/[0.04] sm:p-8',
        'opacity-0',
        isVisible && 'animate-reveal-up'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="mb-4 inline-flex rounded-xl bg-primary-500/10 p-3 text-primary-500 transition-colors group-hover:bg-primary-500/20">
        {FEATURE_ICONS[featureKey]}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{t(`features.${featureKey}.title`)}</h3>
      <p className="text-sm leading-relaxed text-dark-400">
        {t(`features.${featureKey}.description`)}
      </p>
    </div>
  )
}

export function FeaturesSection() {
  const { t } = useLanguage()
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section id="features" className="relative bg-dark-950 py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={cn(
            'mx-auto mb-16 max-w-2xl text-center opacity-0 transition-all duration-700',
            isVisible && 'opacity-100 animate-reveal-up'
          )}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t('features.title')}
          </h2>
          <p className="mt-4 text-base text-dark-400 sm:text-lg">{t('features.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {FEATURE_KEYS.map((key, index) => (
            <FeatureCard key={key} featureKey={key} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
