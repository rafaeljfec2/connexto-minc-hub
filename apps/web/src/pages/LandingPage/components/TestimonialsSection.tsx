import { cn } from '@/lib/utils'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useLanguage } from '../hooks/useLanguage'

const TESTIMONIAL_KEYS = ['t1', 't2', 't3'] as const

const AVATAR_GRADIENTS = [
  'from-primary-400 to-red-500',
  'from-primary-500 to-amber-400',
  'from-red-400 to-primary-500',
] as const

interface TestimonialCardProps {
  readonly testimonialKey: string
  readonly index: number
  readonly gradient: string
}

function TestimonialCard({ testimonialKey, index, gradient }: TestimonialCardProps) {
  const { t } = useLanguage()
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 })

  return (
    <div
      ref={ref}
      className={cn(
        'group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-500 hover:border-primary-500/20 hover:bg-white/[0.04] sm:p-8',
        'opacity-0',
        isVisible && 'animate-reveal-up'
      )}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <svg className="mb-4 h-8 w-8 text-primary-500/30" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
      </svg>

      <p className="mb-6 text-sm leading-relaxed text-dark-300 sm:text-base">
        &ldquo;{t(`testimonials.items.${testimonialKey}.quote`)}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white',
            gradient
          )}
        >
          {t(`testimonials.items.${testimonialKey}.name`).charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            {t(`testimonials.items.${testimonialKey}.name`)}
          </p>
          <p className="text-xs text-dark-500">{t(`testimonials.items.${testimonialKey}.role`)}</p>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const { t } = useLanguage()
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="relative bg-dark-950 py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={cn(
            'mx-auto mb-16 max-w-2xl text-center opacity-0 transition-all duration-700',
            isVisible && 'opacity-100 animate-reveal-up'
          )}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t('testimonials.title')}
          </h2>
          <p className="mt-4 text-base text-dark-400 sm:text-lg">{t('testimonials.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {TESTIMONIAL_KEYS.map((key, index) => (
            <TestimonialCard
              key={key}
              testimonialKey={key}
              index={index}
              gradient={AVATAR_GRADIENTS[index]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
