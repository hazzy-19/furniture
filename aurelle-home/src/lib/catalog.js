import { rooms } from '../data/menu.js'
import { products } from '../data/products.js'

// Returns the second segment of the path of any of its categories (e.g. "/shop/living-room/sofas" -> "living-room")
export function roomSlug(room) {
  if (!room) return null
  const samplePath = room.categories?.[0]?.path || room.path
  if (!samplePath) return null
  const segments = samplePath.split('/').filter(Boolean)
  return segments[1] || null
}

// Returns the third segment of its path (e.g. "/shop/living-room/sofas" -> "sofas")
export function categorySlug(category) {
  if (!category?.path) return null
  const segments = category.path.split('/').filter(Boolean)
  return segments[2] || null
}

// Returns the room object matching roomSlug, or null
export function getRoom(rSlug) {
  if (!rSlug) return null
  return rooms.find((r) => roomSlug(r) === rSlug) || null
}

// Returns the category object matching categorySlug within roomSlug, or null
export function getCategory(rSlug, cSlug) {
  const room = getRoom(rSlug)
  if (!room || !room.categories) return null
  return room.categories.find((c) => categorySlug(c) === cSlug) || null
}

// Returns the product matching slug, or null
export function getProductBySlug(slug) {
  if (!slug) return null
  return products.find((p) => p.slug === slug) || null
}

// Returns the product matching id, or null
export function getProductById(id) {
  if (!id) return null
  return products.find((p) => p.id === id) || null
}

// Returns up to n related products: prioritized from the same room, then other rooms
export function getRelated(product, n = 4) {
  if (!product) return []
  const sameRoom = products.filter(
    (p) => p.id !== product.id && p.room === product.room
  )
  if (sameRoom.length >= n) {
    return sameRoom.slice(0, n)
  }
  const otherProducts = products.filter(
    (p) => p.id !== product.id && p.room !== product.room
  )
  return [...sameRoom, ...otherProducts].slice(0, n)
}
