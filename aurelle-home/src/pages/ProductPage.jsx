import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Image as ImageIcon,
  Heart,
  Minus,
  Plus,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react'
import Icon from '../components/Icon.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useFavorites } from '../context/FavoritesContext.jsx'
import { useOrderList } from '../context/OrderListContext.jsx'
import { formatKes } from '../lib/format.js'
import { getProductBySlug, getRelated, getRoom, getCategory } from '../lib/catalog.js'
import { buildOrderUrl, buildQuestionUrl } from '../lib/whatsapp.js'

function ProductDetail({ product }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { addItem } = useOrderList()
  const isFav = isFavorite(product.id)

  const [isAdded, setIsAdded] = useState(false)
  const addedTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) {
        clearTimeout(addedTimerRef.current)
      }
    }
  }, [])

  const handleAddToOrder = () => {
    addItem(product, quantity)
    setIsAdded(true)
    if (addedTimerRef.current) {
      clearTimeout(addedTimerRef.current)
    }
    addedTimerRef.current = setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  const roomObj = getRoom(product.room)
  const catObj = getCategory(product.room, product.category)

  // Images resolution: product.images if has items, else [product.image] if exists, else []
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : []

  const [selectedIndex, setSelectedIndex] = useState(0)
  const currentImage = images[selectedIndex] || null

  const maxQuantity = Math.min(product.stock, 10)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    document.title = `${product.name} | Aurelle Home`
  }, [product.name])

  const relatedProducts = getRelated(product, 4)

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="pt-6 text-sm text-ink/70">
        <Link to="/" className="hover:text-brand-500">
          Home
        </Link>
        <span className="mx-2">/</span>
        {roomObj && (
          <>
            <Link to={`/shop/${product.room}`} className="hover:text-brand-500">
              {roomObj.label}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        {catObj && (
          <>
            <Link
              to={`/shop/${product.room}/${product.category}`}
              className="hover:text-brand-500"
            >
              {catObj.label}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span aria-current="page" className="text-ink">
          {product.name}
        </span>
      </nav>

      {/* Main Grid: Gallery & Info */}
      <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Gallery (Left) */}
        <div>
          <div className="relative h-[320px] w-full overflow-hidden rounded-lg bg-brand-200 md:h-[480px]">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon
                icon={ImageIcon}
                size={48}
                className="absolute inset-0 m-auto text-brand-700"
              />
            )}

            {/* Status Badge */}
            {product.badge && (
              <span
                className={`absolute left-2 top-2 rounded-[4px] px-2 py-1 text-xs font-medium ${
                  product.badge === 'new'
                    ? 'bg-brand-900 text-white'
                    : 'bg-gold-500 text-brand-900'
                }`}
              >
                {product.badge === 'new' ? 'New' : 'Hot'}
              </span>
            )}

            {/* Favorite Heart Button */}
            <button
              type="button"
              onClick={() => toggleFavorite(product)}
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-[4px] bg-white text-ink hover:text-brand-500 cursor-pointer transition-colors"
              aria-label={`Add ${product.name} to favorites`}
              aria-pressed={isFav}
            >
              <Icon
                icon={Heart}
                size={20}
                className={isFav ? 'fill-brand-500 text-brand-500' : ''}
              />
            </button>
          </div>

          {/* Thumbnails (only when >= 2 images) */}
          {images.length >= 2 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-[4px] border-2 cursor-pointer ${
                    selectedIndex === i ? 'border-ink' : 'border-brand-200'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info (Right) */}
        <div>
          <h1 className="font-heading text-3xl text-brand-900 md:text-4xl">
            {product.name}
          </h1>

          <p className="mt-3 text-2xl font-medium text-brand-700">
            {formatKes(product.priceKes)}
            {product.compareAtPriceKes && (
              <span className="ml-3 text-base font-normal text-ink/50 line-through">
                {formatKes(product.compareAtPriceKes)}
              </span>
            )}
          </p>

          {/* Stock line */}
          <p
            className={`mt-2 text-sm ${
              product.stock === 0
                ? 'text-red-700'
                : product.stock <= product.lowStockThreshold
                  ? 'text-brand-700'
                  : 'text-ink/70'
            }`}
          >
            {product.stock === 0
              ? 'Out of stock'
              : product.stock <= product.lowStockThreshold
                ? `Only ${product.stock} left`
                : 'In stock'}
          </p>

          <p className="mt-5 text-base leading-relaxed text-ink/80">
            {product.description}
          </p>

          {/* Specs */}
          <dl className="mt-6 divide-y divide-brand-200 border-y border-brand-200 text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-ink/70">Material</dt>
              <dd className="text-ink font-medium">{product.material}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-ink/70">Color</dt>
              <dd className="text-ink font-medium">{product.color}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-ink/70">Dimensions</dt>
              <dd className="text-ink font-medium">
                {product.widthCm} x {product.depthCm} x {product.heightCm} cm
              </dd>
            </div>
          </dl>

          {/* Quantity (hidden when stock is 0) */}
          {product.stock > 0 && (
            <>
              <p className="mt-6 text-sm text-ink">Quantity</p>
              <div className="mt-2 flex items-center">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-12 w-12 items-center justify-center border-2 border-ink text-ink hover:bg-ink hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Icon icon={Minus} size={18} />
                </button>
                <span
                  className="flex h-12 w-14 items-center justify-center border-y-2 border-ink text-base font-medium"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  disabled={quantity >= maxQuantity}
                  className="flex h-12 w-12 items-center justify-center border-2 border-ink text-ink hover:bg-ink hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                  aria-label="Increase quantity"
                >
                  <Icon icon={Plus} size={18} />
                </button>
              </div>
            </>
          )}

          {/* Primary Action Button */}
          {product.stock > 0 ? (
            <a
              href={buildOrderUrl([{ product, quantity }])}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-brand-900 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Icon icon={MessageCircle} size={20} />
              Order on WhatsApp
            </a>
          ) : (
            <a
              href={buildQuestionUrl(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-brand-900 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Icon icon={MessageCircle} size={20} />
              Ask about availability
            </a>
          )}

          {/* Add to order list button (only when stock > 0) */}
          {product.stock > 0 && (
            <div>
              <button
                type="button"
                onClick={handleAddToOrder}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[4px] border-2 border-ink text-sm font-medium text-ink hover:bg-ink hover:text-white cursor-pointer transition-colors"
              >
                <Icon icon={ShoppingBag} size={20} />
                <span aria-live="polite">
                  {isAdded ? 'Added to order list' : 'Add to order list'}
                </span>
              </button>
              {isAdded && (
                <div aria-live="polite">
                  <Link
                    to="/order"
                    className="mt-2 block text-center text-sm font-medium text-brand-700 underline hover:text-brand-500"
                  >
                    View order list
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Secondary Link */}
          <a
            href={buildQuestionUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center text-sm font-medium text-brand-700 underline hover:text-brand-500 transition-colors"
          >
            Ask a question on WhatsApp
          </a>

          {/* Confirmation Note */}
          <p className="mt-4 text-xs text-ink/60">
            Delivery and payment are confirmed with you on WhatsApp.
          </p>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-heading text-2xl text-brand-900 md:text-3xl">
            You may also like
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-4">
            {relatedProducts.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default function ProductPage() {
  const { slug } = useParams()
  const product = getProductBySlug(slug)

  useEffect(() => {
    if (!product) {
      document.title = 'Product not found | Aurelle Home'
    }
  }, [product])

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-8 text-center">
          <h1 className="font-heading text-2xl text-brand-900">
            We could not find that product
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

  return <ProductDetail key={product.slug} product={product} />
}

