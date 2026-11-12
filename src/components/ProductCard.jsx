import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Image as ImageIcon } from 'lucide-react'
import Icon from './Icon.jsx'
import { formatKes } from '../lib/format.js'

export default function ProductCard({ product, onToggleFavorite }) {
  const [isFavorite, setIsFavorite] = useState(false)

  if (!product) return null

  const {
    slug,
    name,
    priceKes,
    compareAtPriceKes,
    badge,
    image,
    stock,
    lowStockThreshold,
  } = product

  const handleToggleFavorite = () => {
    setIsFavorite((prev) => !prev)
    onToggleFavorite?.(product)
  }

  return (
    <article className="group">
      {/* Product Image Area */}
      <div className="relative h-[220px] w-full overflow-hidden rounded-lg bg-brand-200 md:h-[260px]">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon
            icon={ImageIcon}
            size={40}
            className="absolute inset-0 m-auto text-brand-700"
          />
        )}

        {/* Product Status Badge */}
        {badge && (
          <span
            className={`absolute left-2 top-2 rounded-[4px] px-2 py-1 text-xs font-medium ${
              badge === 'new'
                ? 'bg-brand-900 text-white'
                : 'bg-gold-500 text-brand-900'
            }`}
          >
            {badge === 'new' ? 'New' : 'Hot'}
          </span>
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-[4px] bg-white text-ink hover:text-brand-500 cursor-pointer transition-colors"
          aria-label={`Add ${name} to favorites`}
          aria-pressed={isFavorite}
        >
          <Icon
            icon={Heart}
            size={20}
            className={isFavorite ? 'fill-brand-500 text-brand-500' : ''}
          />
        </button>
      </div>

      {/* Product Info */}
      <Link
        to={`/product/${slug}`}
        className="mt-3 block text-base text-ink hover:text-brand-500 transition-colors"
      >
        {name}
      </Link>

      <p className="mt-1 text-base font-medium text-brand-700">
        {formatKes(priceKes)}
        {compareAtPriceKes && (
          <span className="ml-2 text-sm font-normal text-ink/50 line-through">
            {formatKes(compareAtPriceKes)}
          </span>
        )}
      </p>

      {/* Low stock indicator */}
      {typeof stock === 'number' && stock <= lowStockThreshold && (
        <p className="mt-1 text-xs text-ink/70">Only {stock} left</p>
      )}
    </article>
  )
}

