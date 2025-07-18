import { Hero } from '@/components/home/hero'
import { Features } from '@/components/home/features'
import { Gallery } from '@/components/home/gallery'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function HomePage() {
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
