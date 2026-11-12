import { Link } from 'react-router-dom'
import usePageMeta from '../lib/usePageMeta.js'

export default function NotFoundPage() {
  usePageMeta({
    title: 'Page not found | Aurelle Home',
    description: 'Page not found.',
    noindex: true,
  })

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-lg border-2 border-ink bg-brand-50 p-8 text-center md:p-12">
        <h1 className="font-heading text-3xl text-brand-900 md:text-4xl">
          Page not found
        </h1>
        <p className="mt-2 text-base text-ink/80">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-[4px] bg-brand-900 px-6 text-sm font-medium text-white hover:bg-brand-700"
          >
            Back to home
          </Link>
          <Link
            to="/shop/living-room"
            className="inline-flex h-12 items-center justify-center rounded-[4px] border-2 border-ink px-6 text-sm font-medium text-ink hover:bg-ink hover:text-white"
          >
            Shop living room
          </Link>
        </div>
      </div>
    </div>
  )
}

