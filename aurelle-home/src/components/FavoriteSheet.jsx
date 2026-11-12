import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import Icon from './Icon.jsx'
import { useFavorites } from '../context/FavoritesContext.jsx'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function FavoriteSheet() {
  const { pendingProduct, closeSheet, completeSheet } = useFavorites()
  const [sheetState, setSheetState] = useState('form') // 'form' | 'sending' | 'done'
  const [email, setEmail] = useState('')
  const [wantsNewArrivals, setWantsNewArrivals] = useState(true)
  const [wantsHotItems, setWantsHotItems] = useState(true)
  const [wantsLowStock, setWantsLowStock] = useState(true)
  const [error, setError] = useState('')

  const isOpen = pendingProduct !== null

  const resetForm = () => {
    setSheetState('form')
    setEmail('')
    setWantsNewArrivals(true)
    setWantsHotItems(true)
    setWantsLowStock(true)
    setError('')
  }

  const handleOpenChange = (open) => {
    if (!open) {
      closeSheet()
      resetForm()
    }
  }

  const handleDone = () => {
    closeSheet()
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedEmail = email.trim()

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setError('')
    setSheetState('sending')

    try {
      await completeSheet({
        email: trimmedEmail,
        wantsNewArrivals,
        wantsHotItems,
        wantsLowStock,
      })
      setSheetState('done')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setSheetState('form')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-lg border-2 border-ink bg-page p-6 md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[440px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-lg">
          {/* Close button top right */}
          <Dialog.Close
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center text-ink hover:text-brand-500 cursor-pointer"
          >
            <Icon icon={X} size={20} />
          </Dialog.Close>

          <Dialog.Title className="font-heading text-2xl text-brand-900">
            Save to favorites
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink/70">
            We will email you about this piece and other new arrivals.
          </Dialog.Description>

          {pendingProduct && (
            <p className="mt-4 text-base font-medium text-brand-700">
              {pendingProduct.name}
            </p>
          )}

          {sheetState === 'done' ? (
            <div className="mt-4">
              <h3 className="font-heading text-xl font-semibold text-brand-900">
                Saved
              </h3>
              <p className="mt-2 text-sm text-ink/70">
                Check your inbox to confirm your email so we can send alerts.
              </p>
              <button
                type="button"
                onClick={handleDone}
                className="mt-4 h-12 w-full rounded-[4px] bg-brand-900 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="fav-sheet-email"
                  className="text-sm text-ink mb-1 block"
                >
                  Email address
                </label>
                <input
                  id="fav-sheet-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  className="mt-4 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base"
                />
              </div>

              {error && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <label className="mt-3 flex items-center gap-3 text-sm text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantsNewArrivals}
                  onChange={(e) => setWantsNewArrivals(e.target.checked)}
                  className="h-4 w-4 accent-brand-500"
                />
                New arrivals
              </label>

              <label className="mt-3 flex items-center gap-3 text-sm text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantsHotItems}
                  onChange={(e) => setWantsHotItems(e.target.checked)}
                  className="h-4 w-4 accent-brand-500"
                />
                Hot items
              </label>

              <label className="mt-3 flex items-center gap-3 text-sm text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantsLowStock}
                  onChange={(e) => setWantsLowStock(e.target.checked)}
                  className="h-4 w-4 accent-brand-500"
                />
                Low stock on my favorites
              </label>

              <p className="mt-3 text-xs text-ink/60">
                By continuing you agree to receive emails from Aurelle Home. You can
                unsubscribe at any time.
              </p>

              <button
                type="submit"
                disabled={sheetState === 'sending'}
                className="mt-4 h-12 w-full rounded-[4px] bg-brand-900 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 cursor-pointer"
              >
                {sheetState === 'sending' ? 'Saving...' : 'Save favorite'}
              </button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

