import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Icon from './Icon.jsx'
import ProductCard from './ProductCard.jsx'
import { getProducts } from '../lib/api.js'

export default function NewAndHot() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignoreResult = false

    getProducts()
      .then((data) => {
        if (!ignoreResult) setProducts(data)
      })
      .catch((requestError) => {
        if (!ignoreResult) setError(requestError.message)
      })
      .finally(() => {
        if (!ignoreResult) setLoading(false)
      })

    return () => {
      ignoreResult = true
    }
  }, [])

  const hotAndNewProducts = useMemo(
    () => products.filter((product) => product.badge === 'new' || product.badge === 'hot'),
    [products]
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

  useEffect(() => {
    if (!emblaApi) return

    emblaApi.reInit()
    update()
  }, [emblaApi, hotAndNewProducts, update])

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
            className="flex h-10 w-10 cursor-pointer items-center justify-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <Icon icon={ChevronLeft} size={20} />
          </button>

          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label="Next products"
            className="flex h-10 w-10 cursor-pointer items-center justify-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30"
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

      {loading ? (
        <p className="py-6 text-sm text-ink/70">Loading products...</p>
      ) : error ? (
        <p className="py-6 text-sm text-ink/70">
          Could not load products: {error}
        </p>
      ) : hotAndNewProducts.length === 0 ? (
        <p className="py-6 text-sm text-ink/70">
          No new or hot products are available yet.
        </p>
      ) : (
        /* Embla Carousel Viewport */
        <div ref={viewportRef} className="overflow-hidden">
          <div className="-ml-4 flex">
            {hotAndNewProducts.map((product) => (
              <div
                key={product.id}
                className="min-w-0 shrink-0 grow-0 basis-[72%] pl-4 sm:basis-[45%] md:basis-[30%] lg:basis-[23%]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}