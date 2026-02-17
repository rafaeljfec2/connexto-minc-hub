import { BrandText } from '@/components/ui/BrandText'
import { useLanguage } from '../hooks/useLanguage'

export function FooterSection() {
  const { t } = useLanguage()

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const linkGroups = [
    {
      titleKey: 'footer.product',
      links: [
        { labelKey: 'footer.features', action: () => scrollToSection('features') },
        { labelKey: 'footer.pricing', action: () => scrollToSection('pricing') },
      ],
    },
    {
      titleKey: 'footer.resources',
      links: [
        { labelKey: 'footer.docs', action: undefined },
        { labelKey: 'footer.support', action: undefined },
        { labelKey: 'footer.blog', action: undefined },
      ],
    },
    {
      titleKey: 'footer.company',
      links: [
        { labelKey: 'footer.about', action: undefined },
        { labelKey: 'footer.contact', action: undefined },
        { labelKey: 'footer.privacy', action: undefined },
        { labelKey: 'footer.terms', action: undefined },
      ],
    },
  ]

  return (
    <footer className="border-t border-white/5 bg-dark-950 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <BrandText size="lg" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-dark-500">
              {t('footer.description')}
            </p>
          </div>

          {linkGroups.map(group => (
            <div key={group.titleKey}>
              <h4 className="mb-4 text-sm font-semibold text-white">{t(group.titleKey)}</h4>
              <ul className="space-y-2.5">
                {group.links.map(link => (
                  <li key={link.labelKey}>
                    <button
                      type="button"
                      onClick={link.action}
                      className="text-sm text-dark-500 transition-colors hover:text-primary-500"
                    >
                      {t(link.labelKey)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-dark-600">
            &copy; {new Date().getFullYear()} MINC Teams. {t('footer.rights')}
          </p>
          <p className="flex items-center gap-1 text-xs text-dark-600">
            {t('footer.madeBy')}{' '}
            <svg className="h-3.5 w-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>{' '}
            {t('footer.byCompany')}
          </p>
        </div>
      </div>
    </footer>
  )
}
