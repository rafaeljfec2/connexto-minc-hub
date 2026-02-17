import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/Accordion'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useLanguage } from '../hooks/useLanguage'

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const

export function FaqSection() {
  const { t } = useLanguage()
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section id="faq" className="relative bg-dark-950 py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={cn(
            'mx-auto mb-16 max-w-2xl text-center opacity-0 transition-all duration-700',
            isVisible && 'opacity-100 animate-reveal-up'
          )}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t('faq.title')}
          </h2>
          <p className="mt-4 text-base text-dark-400 sm:text-lg">{t('faq.subtitle')}</p>
        </div>

        <Accordion className="space-y-3">
          {FAQ_KEYS.map(key => (
            <AccordionItem
              key={key}
              value={key}
              className="rounded-xl border-white/5 bg-white/[0.02] hover:border-white/10"
            >
              <AccordionTrigger className="px-5 py-4 text-sm font-medium text-white hover:bg-white/[0.02] sm:px-6 sm:text-base">
                {t(`faq.items.${key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="border-t-white/5 bg-transparent px-5 py-4 text-sm leading-relaxed text-dark-400 sm:px-6">
                {t(`faq.items.${key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
