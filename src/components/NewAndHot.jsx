import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Icon from './Icon.jsx'
import ProductCard from './ProductCard.jsx'
import { products } from '../data/products.js'

export default function NewAndHot() {
  const hotAndNewProducts = products.filter(
    (p) => p.badge === 'new' || p.badge === 'hot'
  )

  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    update()
    emblaApi.on('select', update)
    emblaApi.on('reInit', update)
    return () => {
      emblaApi.off('select', update)
      emblaApi.off('reInit', update)
    }
  }, [emblaApi, update])

  return (
    <section className="mx-auto max-w-6xl px-6 pb-12 md:pb-16">
      {/* Header Row */}
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-heading text-2xl text-brand-900 md:text-3xl">
          New and hot
        </h2>

        {/* Desktop Carousel Controls */}
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            aria-label="Previous products"
            className="flex h-10 w-10 items-center justify-center border-2 border-ink text-ink hover:bg-ink hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
          >
            <Icon icon={ChevronLeft} size={20} />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label="Next products"
            className="flex h-10 w-10 items-center justify-center border-2 border-ink text-ink hover:bg-ink hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
          >
            <Icon icon={ChevronRight} size={20} />
          </button>
        </div>

        {/* Mobile View all link */}
        <Link
          to="/new"
          className="text-sm font-medium text-brand-700 md:hidden"
        >
          View all
        </Link>
      </div>

      {/* Embla Carousel Viewport */}
      <div ref={viewportRef} className="overflow-hidden">
        <div className="flex -ml-4">
          {hotAndNewProducts.map((p) => (
            <div
              key={p.id}
              className="min-w-0 shrink-0 grow-0 basis-[72%] pl-4 sm:basis-[45%] md:basis-[30%] lg:basis-[23%]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

