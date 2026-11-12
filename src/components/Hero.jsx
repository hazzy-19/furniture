import { Link } from 'react-router-dom'
import { Sofa } from 'lucide-react'
import Icon from './Icon.jsx'
import { heroData } from '../data/hero.js'

export default function Hero() {
  const {
    eyebrow,
    headlineDesktop,
    headlineMobile,
    subtext,
    ctaLabelDesktop,
    ctaLabelMobile,
    ctaPath,
    badge,
    imageDesktop,
    imageMobile,
    imageAlt,
  } = heroData

  const hasImages = Boolean(imageDesktop && imageMobile)

  return (
    <section className="relative isolate h-[420px] overflow-hidden bg-brand-900 text-white md:h-[460px] lg:h-[520px]">
      {/* Layer 1: Background image / flat placeholder */}
      <div className="absolute inset-0 -z-10">
        {hasImages ? (
          <picture>
            <source media="(min-width: 768px)" srcSet={imageDesktop} />
            <img
              src={imageMobile}
              alt={imageAlt}
              className="h-full w-full object-cover"
            />
          </picture>
        ) : (
          <div className="h-full w-full bg-brand-700">
            <Icon
              icon={Sofa}
              size={160}
              className="absolute bottom-[12%] right-[8%] text-brand-500/40 md:hidden"
              aria-hidden="true"
            />
            <Icon
              icon={Sofa}
              size={256}
              className="absolute bottom-[12%] right-[8%] text-brand-500/40 hidden md:block"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Layer 2: Flat scrim */}
      <div className="absolute inset-0 bg-brand-900/55 md:bg-brand-900/40" />

      {/* Layer 3: Discount / promotion badge */}
      <span className="absolute right-4 top-4 rounded-[4px] bg-white px-2 py-1 text-xs font-medium text-brand-900 md:right-8 md:top-8 md:px-3 md:py-1.5 md:text-sm">
        {badge}
      </span>

      {/* Layer 4: Content */}
      <div className="relative mx-auto flex h-full max-w-6xl items-end px-6 pb-8 md:items-center md:pb-0">
        <div className="max-w-md md:max-w-lg">
          {/* Eyebrow - Desktop only */}
          <p className="mb-3 hidden text-xs font-medium uppercase tracking-[0.2em] text-gold-500 md:block">
            {eyebrow}
          </p>

          {/* Headline - Single h1 with responsive spans */}
          <h1 className="font-heading text-4xl leading-tight md:text-5xl lg:text-6xl">
            <span className="md:hidden">{headlineMobile}</span>
            <span className="hidden md:inline">{headlineDesktop}</span>
          </h1>

          {/* Subtext - Desktop only */}
          <p className="mt-4 hidden text-base text-white/85 md:block">
            {subtext}
          </p>

          {/* Call to action */}
          <Link
            to={ctaPath}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[4px] bg-gold-500 px-6 text-sm font-medium text-brand-900 hover:bg-white md:w-auto"
          >
            <span className="md:hidden">{ctaLabelMobile}</span>
            <span className="hidden md:inline">{ctaLabelDesktop}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

