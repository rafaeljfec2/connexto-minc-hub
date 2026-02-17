import { cn } from '@/lib/utils'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useLanguage } from '../hooks/useLanguage'

export function ScreenshotsSection() {
  const { t } = useLanguage()
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.15 })

  return (
    <section className="relative overflow-hidden bg-dark-950 py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary-600/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={cn(
            'mx-auto mb-16 max-w-2xl text-center opacity-0 transition-all duration-700',
            isVisible && 'opacity-100 animate-reveal-up'
          )}
        >
          <span className="mb-4 inline-flex rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-400 sm:text-sm">
            {t('screenshots.badge')}
          </span>
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t('screenshots.title')}
          </h2>
          <p className="mt-4 text-base text-dark-400 sm:text-lg">{t('screenshots.subtitle')}</p>
        </div>

        <div
          className={cn(
            'mx-auto max-w-5xl opacity-0 transition-all delay-200 duration-1000',
            isVisible && 'opacity-100 animate-reveal-scale'
          )}
        >
          <div className="overflow-hidden rounded-xl border border-white/10 bg-dark-900/50 shadow-2xl shadow-primary-500/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-white/5 bg-dark-900/80 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <div className="ml-4 flex-1 rounded-md bg-dark-800/80 px-3 py-1 text-center text-xs text-dark-500">
                app.mincteams.com
              </div>
            </div>

            <div className="relative aspect-video bg-dark-900/30 p-4 sm:p-8">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardMockup() {
  return (
    <div className="flex h-full gap-4">
      <div className="hidden w-48 flex-shrink-0 space-y-3 rounded-lg border border-white/5 bg-dark-800/40 p-3 sm:block">
        {['Dashboard', 'Pessoas', 'Times', 'Escalas', 'Chat'].map((item, i) => (
          <div
            key={item}
            className={cn(
              'rounded-md px-3 py-2 text-xs',
              i === 0 ? 'bg-primary-500/20 text-primary-400' : 'text-dark-500 hover:text-dark-300'
            )}
          >
            {item}
          </div>
        ))}
      </div>

      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Voluntários', value: '248' },
            { label: 'Times', value: '12' },
            { label: 'Escalados', value: '45' },
            { label: 'Presença', value: '92%' },
          ].map(card => (
            <div key={card.label} className="rounded-lg border border-white/5 bg-dark-800/30 p-3">
              <div className="text-[10px] text-dark-500 sm:text-xs">{card.label}</div>
              <div className="mt-1 text-base font-bold text-white sm:text-lg">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 rounded-lg border border-white/5 bg-dark-800/30 p-4">
          <div className="mb-3 text-xs font-medium text-dark-400">Escalas da Semana</div>
          <div className="flex h-24 items-end gap-2 sm:h-32">
            {[
              { height: 40, day: 'D' },
              { height: 65, day: 'S' },
              { height: 35, day: 'T' },
              { height: 80, day: 'Q' },
              { height: 55, day: 'Q' },
              { height: 70, day: 'S' },
              { height: 45, day: 'S' },
            ].map(bar => (
              <div key={bar.day + bar.height} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-primary-600 to-primary-400 transition-all"
                  style={{ height: `${bar.height}%` }}
                />
                <span className="text-[8px] text-dark-600 sm:text-[10px]">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
