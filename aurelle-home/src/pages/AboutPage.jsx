import { Link } from 'react-router-dom'
import { Image as ImageIcon } from 'lucide-react'
import Icon from '../components/Icon.jsx'
import usePageMeta from '../lib/usePageMeta.js'

export default function AboutPage() {
  usePageMeta({
    title: 'About | Aurelle Home',
    description: 'The story and values behind Aurelle Home, premium furniture for Kenyan homes.',
  })

  return (
    <div>
      {/* Hero band */}
      <section className="bg-brand-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
          <h1 className="max-w-2xl font-heading text-4xl leading-tight md:text-5xl">
            Quiet luxury for Kenyan homes
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85">
            Premium furniture for the living room, dining room and bedroom.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Left: Text */}
          <div>
            <h2 className="font-heading text-2xl text-brand-900 md:text-3xl">
              Our story
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink/80">
              Aurelle Home began with a simple idea: a well-made piece of
              furniture should feel calm, last for years, and look at home in a
              Kenyan living space.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink/80">
              We choose honest materials, keep our designs simple, and answer
              our customers directly on WhatsApp, so buying furniture feels
              personal from the first message.
            </p>
          </div>

          {/* Right: Visual placeholder */}
          <div
            className="flex h-[280px] items-center justify-center rounded-lg bg-brand-200 text-brand-700 md:h-[360px]"
            aria-hidden="true"
          >
            <Icon icon={ImageIcon} size={48} className="text-brand-700" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-brand-50 border-y border-brand-200">
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <h2 className="font-heading text-2xl text-brand-900 md:text-3xl">
            What we care about
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border-2 border-ink bg-page p-5">
              <h3 className="font-heading text-xl text-brand-900">
                Considered design
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                Clean lines and a calm palette that sit well in modern homes.
              </p>
            </div>
            <div className="rounded-lg border-2 border-ink bg-page p-5">
              <h3 className="font-heading text-xl text-brand-900">
                Honest materials
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                Solid wood, durable fabrics and finishes chosen to last.
              </p>
            </div>
            <div className="rounded-lg border-2 border-ink bg-page p-5">
              <h3 className="font-heading text-xl text-brand-900">
                Service you can reach
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                Message us on WhatsApp and talk to a real person.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/showrooms"
            className="inline-flex h-12 items-center justify-center rounded-[4px] bg-brand-900 px-6 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Visit a showroom
          </Link>
          <Link
            to="/shop/living-room"
            className="inline-flex h-12 items-center justify-center rounded-[4px] border-2 border-ink px-6 text-sm font-medium text-ink hover:bg-ink hover:text-white transition-colors"
          >
            Shop living room
          </Link>
        </div>
      </section>
    </div>
  )
}

