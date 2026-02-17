import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useLanguage } from '../hooks/useLanguage'

interface StatItemProps {
  readonly value: number
  readonly suffix: string
  readonly label: string
  readonly isVisible: boolean
  readonly delay: number
}

function AnimatedCounter({ value, suffix, label, isVisible, delay }: StatItemProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const timeout = setTimeout(() => {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0
      let step = 0

      const interval = setInterval(() => {
        step++
        current = Math.min(Math.round(increment * step), value)
        setCount(current)
        if (step >= steps) clearInterval(interval)
      }, duration / steps)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [isVisible, value, delay])

  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
        {count.toLocaleString()}
        <span className="text-primary-500">{suffix}</span>
      </div>
      <p className="mt-2 text-sm text-dark-400 sm:text-base">{label}</p>
    </div>
  )
}

const STATS = [
  { key: 'churches', value: 120, suffix: '+' },
  { key: 'volunteers', value: 5000, suffix: '+' },
  { key: 'schedules', value: 15000, suffix: '+' },
  { key: 'services', value: 8500, suffix: '+' },
] as const

export function StatsSection() {
  const { t } = useLanguage()
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.3 })

  return (
    <section className="relative border-y border-white/5 bg-dark-950 py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-600/5 via-transparent to-transparent" />

      <div
        ref={ref}
        className={cn(
          'relative mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:gap-12 lg:px-8',
          'opacity-0 transition-all duration-700',
          isVisible && 'opacity-100'
        )}
      >
        {STATS.map((stat, index) => (
          <AnimatedCounter
            key={stat.key}
            value={stat.value}
            suffix={stat.suffix}
            label={t(`stats.${stat.key}`)}
            isVisible={isVisible}
            delay={index * 150}
          />
        ))}
      </div>
    </section>
  )
}
