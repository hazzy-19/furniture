import { useMemo, useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { getProducts } from '../lib/api.js'
import { categorySlug } from '../lib/catalog.js'
import { useMenu } from '../context/MenuContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import usePageMeta from '../lib/usePageMeta.js'

export default function ShopPage({ mode = 'shop' }) {
  const { room, category } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { rooms } = useMenu()

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')

  useEffect(() => {
    let ignoreResult = false

    getProducts()
      .then((data) => {
        if (!ignoreResult) {
          setProducts(data)
        }
      })
      .catch((error) => {
        if (!ignoreResult) {
          setProductsError(error.message)
        }
      })
      .finally(() => {
        if (!ignoreResult) {
          setProductsLoading(false)
        }
      })

    return () => {
      ignoreResult = true
    }
  }, [])

  const instock = searchParams.get('instock')
  const sort = searchParams.get('sort') || ''

  // Use the live menu so category edits in the database match storefront routes.
  const roomObj =
    mode === 'shop' && room
      ? rooms.find((item) => item.id === room) || null
      : null

  const catObj =
    mode === 'shop' && roomObj && category
      ? roomObj.categories?.find((item) => categorySlug(item) === category) || null
      : null

  const isNotFound =
    mode === 'shop' && (!roomObj || (category && !catObj))

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

  const baseProducts = useMemo(() => {
    if (isNotFound) return []

    if (mode === 'new') {
      return products.filter((product) => product.badge === 'new')
    }

    if (mode === 'sale') {
      return products.filter((product) => product.compareAtPriceKes !== null)
    }

    if (category) {
      return products.filter(
        (product) => product.room === room && product.category === category,
      )
    }

    if (room) {
      return products.filter((product) => product.room === room)
    }

    return products
  }, [mode, room, category, isNotFound, products])

  const displayProducts = useMemo(() => {
    let list = [...baseProducts]

    if (instock === '1') {
      list = list.filter((product) => product.stock > 0)
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

  const chipBaseClass =
    'inline-flex h-10 shrink-0 items-center rounded-[4px] border-2 border-ink px-4 text-sm font-medium transition-colors hover:bg-ink hover:text-white'

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16">
      <nav aria-label="Breadcrumb" className="pt-6 text-sm text-ink/70">
        <Link to="/" className="hover:text-brand-500">
          Home
        </Link>

        {mode === 'new' && (
          <>
            <span className="mx-2">/</span>
            <span aria-current="page" className="text-ink">
              New arrivals
            </span>
          </>
        )}

        {mode === 'sale' && (
          <>
            <span className="mx-2">/</span>
            <span aria-current="page" className="text-ink">
              Sale
            </span>
          </>
        )}

        {mode === 'shop' && roomObj && !catObj && (
          <>
            <span className="mx-2">/</span>
            <span aria-current="page" className="text-ink">
              {roomObj.label}
            </span>
          </>
        )}

        {mode === 'shop' && roomObj && catObj && (
          <>
            <span className="mx-2">/</span>
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

      <h1 className="mt-3 font-heading text-3xl text-brand-900 md:text-4xl">
        {title}
      </h1>

      <p className="mt-1 text-sm text-ink/70">
        {productsLoading
          ? 'Loading products...'
          : `${displayProducts.length} ${displayProducts.length === 1 ? 'product' : 'products'
          }`}
      </p>

      {mode === 'shop' && roomObj && (
        <div className="flex gap-2 overflow-x-auto py-4">
          <Link
            to={`/shop/${room}`}
            className={`${chipBaseClass} ${!category ? 'bg-ink text-white' : ''}`}
          >
            All
          </Link>

          {(roomObj.categories || []).map((item) => {
            const itemSlug = categorySlug(item)
            const isActive = category === itemSlug

            return (
              <Link
                key={item.id || itemSlug}
                to={`/shop/${room}/${itemSlug}`}
                className={`${chipBaseClass} ${isActive ? 'bg-ink text-white' : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-y border-brand-200 py-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
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
            className="h-10 cursor-pointer rounded-[4px] border border-brand-200 bg-white px-3 text-sm"
          >
            <option value="">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>

      {productsError ? (
        <p role="alert" className="mt-8 text-sm text-red-700">
          {productsError}
        </p>
      ) : productsLoading ? (
        <p role="status" className="mt-8 text-sm text-ink/70">
          Loading products...
        </p>
      ) : displayProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4">
          {displayProducts.map((product) => (
            <ProductCard product={product} key={product.id} />
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