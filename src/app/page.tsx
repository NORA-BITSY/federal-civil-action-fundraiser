import { Hero } from '@/components/homepage/Hero'
import { FeaturedCampaigns } from '@/components/homepage/FeaturedCampaigns'
import { Stats } from '@/components/homepage/Stats'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeaturedCampaigns />
      <Stats />
    </main>
  )
}