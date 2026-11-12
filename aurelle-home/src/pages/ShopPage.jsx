import { useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { products } from '../data/products.js'
import { getRoom, getCategory, categorySlug } from '../lib/catalog.js'
import ProductCard from '../components/ProductCard.jsx'
import usePageMeta from '../lib/usePageMeta.js'

export default function ShopPage({ mode = 'shop' }) {
  const { room, category } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const instock = searchParams.get('instock')
  const sort = searchParams.get('sort') || ''

  // Validate room and category in "shop" mode
  const roomObj = mode === 'shop' && room ? getRoom(room) : null
  const catObj = mode === 'shop' && room && category ? getCategory(room, category) : null

  const isNotFound =
    mode === 'shop' && (!roomObj || (category && !catObj))

  // Determine page title
  let title = 'Shop'
  if (isNotFound) {
    title = 'Page not found'
  } else if (mode === 'new') {
    title = 'New arrivals'
  } else if (mode === 'sale') {
    title = 'Sale'
  } else if (catObj) {
    title = catObj.label
  } else if (roomObj) {
    title = roomObj.label
  }

  usePageMeta({
    title: isNotFound ? 'Page not found | Aurelle Home' : `${title} | Aurelle Home`,
    description: isNotFound
      ? 'Page not found.'
      : `Shop ${title.toLowerCase()} at Aurelle Home. Order on WhatsApp.`,
    noindex: isNotFound,
  })

  // Base products filtered by mode / room / category
  const baseProducts = useMemo(() => {
    if (isNotFound) return []

    if (mode === 'new') {
      return products.filter((p) => p.badge === 'new')
    }
    if (mode === 'sale') {
      return products.filter((p) => p.compareAtPriceKes !== null)
    }
    if (category) {
      return products.filter((p) => p.room === room && p.category === category)
    }
    if (room) {
      return products.filter((p) => p.room === room)
    }
    return products
  }, [mode, room, category, isNotFound])

  // Filter and sort products
  const displayProducts = useMemo(() => {
    let list = [...baseProducts]

    if (instock === '1') {
      list = list.filter((p) => p.stock > 0)
    }

    if (sort === 'price-asc') {
      list.sort((a, b) => a.priceKes - b.priceKes)
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.priceKes - a.priceKes)
    }

    return list
  }, [baseProducts, instock, sort])

  const handleInStockChange = (e) => {
    const nextParams = new URLSearchParams(searchParams)
    if (e.target.checked) {
      nextParams.set('instock', '1')
    } else {
      nextParams.delete('instock')
    }
    setSearchParams(nextParams, { replace: true })
  }

  const handleSortChange = (e) => {
    const nextParams = new URLSearchParams(searchParams)
    if (e.target.value) {
      nextParams.set('sort', e.target.value)
    } else {
      nextParams.delete('sort')
    }
    setSearchParams(nextParams, { replace: true })
  }

  // Not found page state
  if (isNotFound) {
    return (
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <nav aria-label="Breadcrumb" className="pt-6 text-sm text-ink/70">
          <Link to="/" className="hover:text-brand-500">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span aria-current="page" className="text-ink">
            Not found
          </span>
        </nav>

        <div className="mt-10 rounded-lg border border-brand-200 bg-brand-50 p-8 text-center">
          <h1 className="font-heading text-xl text-brand-900">
            We could not find that category
          </h1>
          <Link
            to="/"
            className="mt-3 inline-block text-sm font-medium text-brand-700 hover:text-brand-500"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  const n = displayProducts.length
  const chipBaseClass =
    'inline-flex h-10 shrink-0 items-center rounded-[4px] border-2 border-ink px-4 text-sm font-medium hover:bg-ink hover:text-white transition-colors'

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="pt-6 text-sm text-ink/70">
        <Link to="/" className="hover:text-brand-500">
          Home
        </Link>
        <span className="mx-2">/</span>
        {mode === 'new' && (
          <span aria-current="page" className="text-ink">
            New arrivals
          </span>
        )}
        {mode === 'sale' && (
          <span aria-current="page" className="text-ink">
            Sale
          </span>
        )}
        {mode === 'shop' && roomObj && !catObj && (
          <span aria-current="page" className="text-ink">
            {roomObj.label}
          </span>
        )}
        {mode === 'shop' && roomObj && catObj && (
          <>
            <Link to={`/shop/${room}`} className="hover:text-brand-500">
              {roomObj.label}
            </Link>
            <span className="mx-2">/</span>
            <span aria-current="page" className="text-ink">
              {catObj.label}
            </span>
          </>
        )}
      </nav>

      {/* Heading */}
      <h1 className="mt-3 font-heading text-3xl text-brand-900 md:text-4xl">
        {title}
      </h1>
      <p className="mt-1 text-sm text-ink/70">
        {n} {n === 1 ? 'product' : 'products'}
      </p>

      {/* Category chips (shown only in mode "shop" when room is present) */}
      {mode === 'shop' && roomObj && (
        <div className="flex gap-2 overflow-x-auto py-4">
          <Link
            to={`/shop/${room}`}
            className={`${chipBaseClass} ${!category ? 'bg-ink text-white' : ''}`}
          >
            All
          </Link>
          {roomObj.categories.map((c) => {
            const cSlug = categorySlug(c)
            const isActive = category === cSlug
            return (
              <Link
                key={c.id || cSlug}
                to={`/shop/${room}/${cSlug}`}
                className={`${chipBaseClass} ${isActive ? 'bg-ink text-white' : ''}`}
              >
                {c.label}
              </Link>
            )
          })}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-y border-brand-200 py-3">
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input
            type="checkbox"
            checked={instock === '1'}
            onChange={handleInStockChange}
            className="h-4 w-4 accent-brand-500"
          />
          In stock only
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          Sort
          <select
            value={sort}
            onChange={handleSortChange}
            className="h-10 rounded-[4px] border border-brand-200 bg-white px-3 text-sm cursor-pointer"
          >
            <option value="">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>

      {/* Product Grid or Empty State */}
      {displayProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4">
          {displayProducts.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-brand-200 bg-brand-50 p-8 text-center">
          <p className="font-heading text-xl text-brand-900">
            No products here yet
          </p>
          <Link
            to="/"
            className="mt-3 inline-block text-sm font-medium text-brand-700 hover:text-brand-500"
          >
            Back to home
          </Link>
        </div>
      )}
    </div>
  )
}

