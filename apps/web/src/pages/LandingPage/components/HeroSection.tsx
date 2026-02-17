import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

export function HeroSection() {
  const { t } = useLanguage()

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dark-950 pt-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-primary-500/10 blur-[100px] animate-glow-pulse" />
        <div className="absolute left-1/4 top-1/2 h-[200px] w-[200px] rounded-full bg-primary-700/15 blur-[80px] animate-float" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(9,9,11,0.8)_70%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse-slow" />
          <span className="text-xs font-medium text-primary-400 sm:text-sm">MINC Teams v1.0</span>
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          {t('hero.title')}{' '}
          <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-red-500 bg-clip-text text-transparent">
            {t('hero.titleHighlight')}
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-dark-400 sm:text-lg md:text-xl">
          {t('hero.subtitle')}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/login"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-500 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-105 active:scale-95 sm:w-auto"
          >
            {t('hero.cta')}
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
          <button
            type="button"
            onClick={scrollToHowItWorks}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 sm:w-auto"
          >
            {t('hero.ctaSecondary')}
          </button>
        </div>

        <div className="mt-16 flex items-center justify-center gap-8 opacity-50">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dark-950 bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white"
              >
                {String.fromCodePoint(64 + i)}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <svg
                key={i}
                className="h-4 w-4 text-primary-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-sm text-dark-400">5.0</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <svg
          className="h-6 w-6 text-dark-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  )
}
