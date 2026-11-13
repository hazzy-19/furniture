import { useEffect, useState } from 'react'
import { getPromos } from '../lib/api.js'

const DEFAULT_PROMO_MESSAGES = [
  'Free delivery in Nairobi and Mombasa',
  'New arrivals every week',
  'Visit our showrooms',
]

export default function PromoStrip() {
  const [promoMessages, setPromoMessages] = useState(DEFAULT_PROMO_MESSAGES)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    let ignoreResult = false

    getPromos()
      .then((messages) => {
        if (!ignoreResult && Array.isArray(messages) && messages.length > 0) {
          setPromoMessages(messages)
          setCurrentMessageIndex(0)
        }
      })
      .catch((error) => {
        console.error('Could not load promotions:', error)
      })

    return () => {
      ignoreResult = true
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessageIndex(
        (previousIndex) => (previousIndex + 1) % promoMessages.length
      )
    }, 4000)

    return () => clearInterval(timer)
  }, [promoMessages.length])

  return (
    <div
      role="region"
      aria-label="Promotions"
      className="select-none border-b border-brand-200 bg-brand-50 text-xs font-medium text-ink"
    >
      <div className="mx-auto max-w-7xl px-4 py-2">
        {/* Mobile: rotate through the messages */}
        <div
          className="flex min-h-[1.25rem] items-center justify-center text-center md:hidden"
          aria-live="polite"
        >
          <span>{promoMessages[currentMessageIndex]}</span>
        </div>

        {/* Desktop: show every message */}
        <div className="hidden items-center justify-center divide-x divide-brand-200 md:flex">
          {promoMessages.map((message) => (
            <div key={message} className="px-6 text-center">
              <span>{message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}