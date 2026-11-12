import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { getProductById } from '../lib/catalog.js'

const OrderListContext = createContext(null)

const ORDER_STORAGE_KEY = 'aurelle.order'

function getInitialOrderItems() {
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Failed to read order list from localStorage:', err)
    return []
  }
}

export function OrderListProvider({ children }) {
  const [items, setItems] = useState(getInitialOrderItems)

  useEffect(() => {
    try {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.error('Failed to write order list to localStorage:', err)
    }
  }, [items])

  // Derived lines: map to { product, quantity }, skipping missing products
  const lines = useMemo(() => {
    return items
      .map(({ productId, quantity }) => {
        const product = getProductById(productId)
        if (!product) return null
        return { product, quantity }
      })
      .filter(Boolean)
  }, [items])

  const count = useMemo(() => {
    return lines.reduce((sum, line) => sum + line.quantity, 0)
  }, [lines])

  const total = useMemo(() => {
    return lines.reduce(
      (sum, line) => sum + (line.product?.priceKes || 0) * line.quantity,
      0
    )
  }, [lines])

  const addItem = (product, qty = 1) => {
    if (!product || typeof product.stock !== 'number' || product.stock <= 0) {
      return
    }

    const maxStock = Math.min(product.stock, 10)

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === product.id
      )

      if (existingIndex >= 0) {
        const currentQty = prevItems[existingIndex].quantity
        const newQty = Math.max(1, Math.min(maxStock, currentQty + qty))
        const updated = [...prevItems]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        }
        return updated
      }

      const initialQty = Math.max(1, Math.min(maxStock, qty))
      return [...prevItems, { productId: product.id, quantity: initialQty }]
    })
  }

  const setQuantity = (productId, qty) => {
    const product = getProductById(productId)
    if (!product) return
    const maxStock = Math.min(product.stock, 10)
    const clampedQty = Math.max(1, Math.min(maxStock, qty))

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: clampedQty }
          : item
      )
    )
  }

  const removeItem = (productId) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    )
  }

  const clear = () => {
    setItems([])
  }

  const value = {
    items,
    lines,
    count,
    total,
    addItem,
    setQuantity,
    removeItem,
    clear,
  }

  return (
    <OrderListContext.Provider value={value}>
      {children}
    </OrderListContext.Provider>
  )
}

export function useOrderList() {
  const context = useContext(OrderListContext)
  if (!context) {
    throw new Error('useOrderList must be used within an OrderListProvider')
  }
  return context
}

