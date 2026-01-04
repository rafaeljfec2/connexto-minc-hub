import { HeaderProfile } from './HeaderProfile'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { BrandText } from '@/components/ui/BrandText'

const HEADER_CLASSES = {
  container:
    'sticky top-0 z-30 w-full border-b border-dark-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-dark-800 dark:bg-dark-950/95 dark:supports-[backdrop-filter]:dark:bg-dark-950/80 transition-all duration-300 animate-fade-in-down',
  content: 'lg:ml-64',
  inner: 'w-full flex h-16 items-center justify-between overflow-visible',
  logo: 'hidden lg:flex items-center gap-2 -ml-56 transition-transform duration-300 hover:scale-105',
  profile: 'flex-1 lg:flex-none flex items-center justify-end gap-3 pr-4 sm:pr-6 lg:pr-8',
}

export function Header() {
  return (
    <header className={HEADER_CLASSES.container}>
      <div className={HEADER_CLASSES.content}>
        <div className={HEADER_CLASSES.inner}>
          <div className={HEADER_CLASSES.logo}>
            <BrandText size="sm" />
          </div>
          <div className={HEADER_CLASSES.profile}>
            <ThemeToggle />
            <HeaderProfile />
          </div>
        </div>
      </div>
    </header>
  )
}
