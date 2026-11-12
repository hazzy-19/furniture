import Hero from '../components/Hero.jsx'
import CategoryTiles from '../components/CategoryTiles.jsx'
import NewAndHot from '../components/NewAndHot.jsx'
import usePageMeta from '../lib/usePageMeta.js'

export default function Home() {
  usePageMeta({
    title: 'Aurelle Home | Premium furniture for Kenyan homes',
    description:
      'Premium sofas, dining sets, beds and decor for Kenyan homes. Browse online and order on WhatsApp.',
  })

  return (
    <div>
      <Hero />
      <CategoryTiles />
      <NewAndHot />
    </div>
  )
}
