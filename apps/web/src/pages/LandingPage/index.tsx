import { useEffect } from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import { Navbar } from './components/Navbar'
import { HeroSection } from './components/HeroSection'
import { StatsSection } from './components/StatsSection'
import { FeaturesSection } from './components/FeaturesSection'
import { HowItWorksSection } from './components/HowItWorksSection'
import { ScreenshotsSection } from './components/ScreenshotsSection'
import { TestimonialsSection } from './components/TestimonialsSection'
import { PricingSection } from './components/PricingSection'
import { FaqSection } from './components/FaqSection'
import { CtaSection } from './components/CtaSection'
import { FooterSection } from './components/FooterSection'

export default function LandingPage() {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    html.style.overflow = 'auto'
    body.style.overflow = 'auto'

    return () => {
      html.style.overflow = ''
      body.style.overflow = ''
    }
  }, [])

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-dark-950 text-white antialiased">
        <Navbar />
        <main>
          <HeroSection />
          <StatsSection />
          <FeaturesSection />
          <HowItWorksSection />
          <ScreenshotsSection />
          <TestimonialsSection />
          <PricingSection />
          <FaqSection />
          <CtaSection />
        </main>
        <FooterSection />
      </div>
    </LanguageProvider>
  )
}
