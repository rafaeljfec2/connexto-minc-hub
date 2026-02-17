import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useLanguage } from '../hooks/useLanguage'

const PLAN_KEYS = ['free', 'pro', 'enterprise'] as const

interface PlanCardProps {
  readonly planKey: string
  readonly index: number
  readonly isPopular: boolean
}

function PlanCard({ planKey, index, isPopular }: PlanCardProps) {
  const { t, tArray } = useLanguage()
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 })
  const features = tArray(`pricing.${planKey}.features`)

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex flex-col rounded-2xl border p-6 transition-all duration-500 sm:p-8',
        isPopular
          ? 'border-primary-500/40 bg-gradient-to-b from-primary-500/10 to-transparent shadow-lg shadow-primary-500/10'
          : 'border-white/5 bg-white/[0.02] hover:border-white/10',
        'opacity-0',
        isVisible && 'animate-reveal-up'
      )}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-4 py-1 text-xs font-semibold text-white">
          {t('pricing.pro.badge')}
        </span>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{t(`pricing.${planKey}.name`)}</h3>
        <p className="mt-1 text-sm text-dark-400">{t(`pricing.${planKey}.description`)}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-white">{t(`pricing.${planKey}.price`)}</span>
        {planKey !== 'enterprise' && <span className="text-dark-500">{t('pricing.monthly')}</span>}
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map(feature => (
          <li key={feature} className="flex items-start gap-3 text-sm text-dark-300">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        to="/login"
        className={cn(
          'block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all hover:scale-105 active:scale-95',
          isPopular
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25 hover:bg-primary-500'
            : 'border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10'
        )}
      >
        {t(`pricing.${planKey}.cta`)}
      </Link>
    </div>
  )
}

export function PricingSection() {
  const { t } = useLanguage()
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section id="pricing" className="relative bg-dark-950 py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.05),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={cn(
            'mx-auto mb-16 max-w-2xl text-center opacity-0 transition-all duration-700',
            isVisible && 'opacity-100 animate-reveal-up'
          )}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t('pricing.title')}
          </h2>
          <p className="mt-4 text-base text-dark-400 sm:text-lg">{t('pricing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {PLAN_KEYS.map((key, index) => (
            <PlanCard key={key} planKey={key} index={index} isPopular={key === 'pro'} />
          ))}
        </div>
      </div>
    </section>
  )
}
