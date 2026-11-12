import { useState } from 'react'
import { subscribe } from '../lib/api.js'
import { useFavorites } from '../context/FavoritesContext.jsx'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function EmailSignup() {
  const { saveSubscriber } = useFavorites()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: 'idle', message: '' }) // 'idle' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedEmail = email.trim()

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email address.',
      })
      return
    }

    setIsSubmitting(true)
    setStatus({ type: 'idle', message: '' })

    try {
      const subscriberData = {
        email: trimmedEmail,
        wantsNewArrivals: true,
        wantsHotItems: true,
        wantsLowStock: true,
      }

      await subscribe({
        ...subscriberData,
        source: 'footer_signup',
      })

      saveSubscriber(subscriberData)
      setEmail('')
      setStatus({
        type: 'success',
        message: 'Check your inbox to confirm your email.',
      })
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="border-y border-brand-200 bg-brand-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        {/* Left text block */}
        <div>
          <h2 className="font-heading text-2xl text-brand-900 md:text-3xl">
            Get first access to new arrivals
          </h2>
          <p className="mt-1 text-sm text-ink/70">
            Heart a piece and we will tell you when it is almost gone.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="w-full md:w-auto">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status.type === 'error') {
                  setStatus({ type: 'idle', message: '' })
                }
              }}
              placeholder="name@email.com"
              aria-label="Email address"
              disabled={isSubmitting}
              className="h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base sm:w-72"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-[4px] bg-brand-900 px-6 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 cursor-pointer transition-colors"
            >
              {isSubmitting ? 'Signing up...' : 'Sign me up'}
            </button>
          </div>

          <p className="mt-2 text-xs text-ink/60">
            By subscribing you agree to receive emails from Aurelle Home.
            Unsubscribe at any time.
          </p>

          {status.message && (
            <p
              aria-live="polite"
              className={`mt-2 text-sm ${
                status.type === 'success' ? 'text-brand-700' : 'text-red-700'
              }`}
            >
              {status.message}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}

