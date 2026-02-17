import { cn } from '@/lib/utils'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useLanguage } from '../hooks/useLanguage'

const STEPS = [
  {
    key: 'step1',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
      </svg>
    ),
  },
  {
    key: 'step2',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    key: 'step3',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
  },
] as const

export function HowItWorksSection() {
  const { t } = useLanguage()
  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section id="how-it-works" className="relative bg-dark-950 py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(249,115,22,0.05),transparent_70%)]" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          ref={titleRef}
          className={cn(
            'mx-auto mb-16 max-w-2xl text-center opacity-0 transition-all duration-700',
            titleVisible && 'opacity-100 animate-reveal-up'
          )}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t('howItWorks.title')}
          </h2>
          <p className="mt-4 text-base text-dark-400 sm:text-lg">{t('howItWorks.subtitle')}</p>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-primary-500/50 via-primary-500/20 to-transparent md:left-1/2 md:block" />

          <div className="space-y-12 md:space-y-16">
            {STEPS.map((step, index) => (
              <StepItem key={step.key} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

interface StepItemProps {
  readonly step: (typeof STEPS)[number]
  readonly index: number
}

function StepItem({ step, index }: StepItemProps) {
  const { t } = useLanguage()
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.3 })

  const isEven = index % 2 === 0

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex flex-col gap-6 md:flex-row md:items-center md:gap-12',
        !isEven && 'md:flex-row-reverse',
        'opacity-0 transition-all duration-700',
        isVisible && 'opacity-100 animate-reveal-up'
      )}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="hidden md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-500 bg-dark-950 text-lg font-bold text-primary-500">
          {index + 1}
        </div>
      </div>

      <div className={cn('flex-1', isEven ? 'md:pr-20 md:text-right' : 'md:pl-20')}>
        <div className={cn('flex items-center gap-4 md:hidden')}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-sm font-bold text-primary-500">
            {index + 1}
          </div>
          <h3 className="text-lg font-semibold text-white">{t(`howItWorks.${step.key}.title`)}</h3>
        </div>

        <h3 className="mt-3 hidden text-xl font-semibold text-white md:mt-0 md:block">
          {t(`howItWorks.${step.key}.title`)}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-dark-400 sm:text-base">
          {t(`howItWorks.${step.key}.description`)}
        </p>
      </div>

      <div className="hidden flex-1 md:block">
        <div
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-primary-500',
            isEven ? 'md:ml-20' : 'md:ml-auto md:mr-20'
          )}
        >
          {step.icon}
        </div>
      </div>
    </div>
  )
}
