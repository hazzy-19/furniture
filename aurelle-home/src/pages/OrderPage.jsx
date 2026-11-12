import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Image as ImageIcon,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
} from 'lucide-react'
import Icon from '../components/Icon.jsx'
import { useOrderList } from '../context/OrderListContext.jsx'
import { formatKes } from '../lib/format.js'
import { buildOrderUrl } from '../lib/whatsapp.js'
import usePageMeta from '../lib/usePageMeta.js'

export default function OrderPage() {
  const { lines, count, total, setQuantity, removeItem, clear } = useOrderList()
  const [deliveryLocation, setDeliveryLocation] = useState('')

  usePageMeta({
    title: 'Your order list | Aurelle Home',
    description: 'Review your order list and send it on WhatsApp.',
    noindex: true,
  })

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16">
      <h1 className="mt-6 font-heading text-3xl text-brand-900 md:text-4xl">
        Your order list
      </h1>

      {lines.length === 0 ? (
        <div className="mt-8 rounded-lg border border-brand-200 bg-brand-50 p-8 text-center">
          <p className="font-heading text-xl text-brand-900">
            Your order list is empty
          </p>
          <Link
            to="/shop/living-room"
            className="mt-3 inline-block text-sm font-medium text-brand-700 hover:text-brand-500"
          >
            Browse living room
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
          {/* Left: Product Lines */}
          <ul>
            {lines.map(({ product, quantity }) => {
              const maxStock = Math.min(product.stock, 10)
              const lineTotal = (product.priceKes || 0) * quantity

              return (
                <li
                  key={product.id}
                  className="flex gap-4 border-b border-brand-200 py-4"
                >
                  {/* Image block */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-brand-200 md:h-24 md:w-24">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Icon
                        icon={ImageIcon}
                        size={28}
                        className="text-brand-700"
                      />
                    )}
                  </div>

                  {/* Middle content */}
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/product/${product.slug}`}
                      className="block truncate text-base text-ink hover:text-brand-500"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-ink/70">
                      {formatKes(product.priceKes)} each
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, quantity - 1)}
                          disabled={quantity <= 1}
                          className="flex h-10 w-10 items-center justify-center border-2 border-ink text-ink hover:bg-ink hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                          aria-label={`Decrease quantity of ${product.name}`}
                        >
                          <Icon icon={Minus} size={16} />
                        </button>
                        <span
                          className="flex h-10 w-12 items-center justify-center border-y-2 border-ink text-sm font-medium"
                          aria-live="polite"
                        >
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          disabled={quantity >= maxStock}
                          className="flex h-10 w-10 items-center justify-center border-2 border-ink text-ink hover:bg-ink hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                          aria-label={`Increase quantity of ${product.name}`}
                        >
                          <Icon icon={Plus} size={16} />
                        </button>
                      </div>

                      {/* Line total */}
                      <p className="text-base font-medium text-brand-700">
                        {formatKes(lineTotal)}
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-ink/70 hover:text-brand-500 cursor-pointer transition-colors"
                      aria-label={`Remove ${product.name}`}
                    >
                      <Icon icon={Trash2} size={16} />
                      Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Right: Order Summary Sidebar */}
          <aside className="h-fit rounded-lg border-2 border-ink bg-brand-50 p-5 lg:sticky lg:top-6">
            <h2 className="font-heading text-xl text-brand-900">
              Order summary
            </h2>

            <div className="mt-4 flex justify-between text-sm text-ink">
              <span>Items</span>
              <span>{count}</span>
            </div>

            <div className="mt-4 flex justify-between text-sm text-ink">
              <span>Subtotal</span>
              <span>{formatKes(total)}</span>
            </div>

            <p className="mt-2 text-xs text-ink/60">
              Delivery fee is confirmed on WhatsApp.
            </p>

            <div className="mt-4 flex justify-between border-t border-brand-200 pt-4 text-lg font-medium text-brand-900">
              <span>Total</span>
              <span>{formatKes(total)}</span>
            </div>

            <label htmlFor="delivery" className="mt-5 block text-sm text-ink">
              Delivery location (optional)
            </label>
            <input
              id="delivery"
              type="text"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base"
              placeholder="Estate or town, for example Kilimani, Nairobi"
            />

            <a
              href={buildOrderUrl(lines, { deliveryLocation })}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-brand-900 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Icon icon={MessageCircle} size={20} />
              Send order on WhatsApp
            </a>

            <button
              type="button"
              onClick={clear}
              className="mt-3 block w-full text-center text-sm font-medium text-ink/70 underline hover:text-brand-500 cursor-pointer"
            >
              Clear order list
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}

