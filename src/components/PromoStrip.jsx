import { useState, useEffect } from 'react'

const PROMO_MESSAGES = [
  'Free delivery in Nairobi and Mombasa',
  'New arrivals every week',
  'Visit our showrooms',
]

export default function PromoStrip() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  // Rotate promo messages on mobile every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % PROMO_MESSAGES.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div
      role="region"
      aria-label="Promotions"
      className="bg-brand-50 text-ink text-xs font-medium border-b border-brand-200 select-none"
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        {/* Mobile View: single message rotating every 4 seconds */}
        <div className="md:hidden text-center min-h-[1.25rem] flex items-center justify-center" aria-live="polite">
          <span>{PROMO_MESSAGES[currentMessageIndex]}</span>
        </div>

        {/* Desktop View: all 3 messages in a row separated by thin vertical dividers */}
        <div className="hidden md:flex items-center justify-center divide-x divide-brand-200">
          {PROMO_MESSAGES.map((message) => (
            <div key={message} className="px-6 text-center">
              <span>{message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

