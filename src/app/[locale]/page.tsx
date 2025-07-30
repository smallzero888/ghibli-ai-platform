import { Hero } from '@/components/home/hero'
import { Features } from '@/components/home/features'
import { Gallery } from '@/components/home/gallery'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useI18n } from '@/lib/i18n'

export default function HomePage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-ghibli-cream">
      <Header />
      <main>
        <Hero />
        <Features />
        <Gallery />
      </main>
      <Footer />
    </div>
  )
}