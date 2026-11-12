import { createContext, useContext, useState, useEffect } from 'react'
import { subscribe, addFavorite, removeFavorite } from '../lib/api.js'

const FavoritesContext = createContext(null)

const FAVORITES_STORAGE_KEY = 'aurelle.favorites'
const SUBSCRIBER_STORAGE_KEY = 'aurelle.subscriber'

function getInitialFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Failed to read favorites from localStorage:', err)
    return []
  }
}

function getInitialSubscriber() {
  try {
    const raw = localStorage.getItem(SUBSCRIBER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error('Failed to read subscriber from localStorage:', err)
    return null
  }
}

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(getInitialFavorites)
  const [subscriber, setSubscriber] = useState(getInitialSubscriber)
  const [pendingProduct, setPendingProduct] = useState(null)

  // Persist favoriteIds to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds))
    } catch (err) {
      console.error('Failed to write favorites to localStorage:', err)
    }
  }, [favoriteIds])

  // Persist subscriber to localStorage on change
  useEffect(() => {
    try {
      if (subscriber) {
        localStorage.setItem(SUBSCRIBER_STORAGE_KEY, JSON.stringify(subscriber))
      } else {
        localStorage.removeItem(SUBSCRIBER_STORAGE_KEY)
      }
    } catch (err) {
      console.error('Failed to write subscriber to localStorage:', err)
    }
  }, [subscriber])

  const isFavorite = (id) => favoriteIds.includes(id)

  const toggleFavorite = (product) => {
    if (!product) return
    const id = product.id

    if (favoriteIds.includes(id)) {
      // Remove from favorites
      setFavoriteIds((prev) => prev.filter((favId) => favId !== id))
      if (subscriber?.email) {
        removeFavorite(subscriber.email, id).catch(() => {})
      }
    } else {
      // Not yet a favorite
      if (!subscriber) {
        // Prompt for email signup via sheet
        setPendingProduct(product)
      } else {
        // Add to favorites and trigger backend sync
        setFavoriteIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
        if (subscriber?.email) {
          addFavorite(subscriber.email, id).catch(() => {})
        }
      }
    }
  }

  const closeSheet = () => {
    setPendingProduct(null)
  }

  const completeSheet = async ({
    email,
    wantsNewArrivals,
    wantsHotItems,
    wantsLowStock,
  }) => {
    await subscribe({
      email,
      wantsNewArrivals,
      wantsHotItems,
      wantsLowStock,
      source: 'favorite_sheet',
    })

    const newSubscriber = {
      email,
      wantsNewArrivals,
      wantsHotItems,
      wantsLowStock,
    }
    setSubscriber(newSubscriber)

    if (pendingProduct) {
      const pid = pendingProduct.id
      setFavoriteIds((prev) => (prev.includes(pid) ? prev : [...prev, pid]))
      await addFavorite(email, pid)
    }
  }

  const saveSubscriber = (sub) => {
    setSubscriber(sub)
  }

  const value = {
    favoriteIds,
    subscriber,
    pendingProduct,
    count: favoriteIds.length,
    isFavorite,
    toggleFavorite,
    closeSheet,
    completeSheet,
    saveSubscriber,
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

