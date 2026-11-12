import { config } from '../config.js'
import { formatKes } from './format.js'

// Returns sanitized phone number with digits only (strips '+', spaces, dashes)
export function getSanitizedWhatsAppNumber() {
  const rawNumber = config.whatsapp?.phoneNumber || ''
  return rawNumber.replace(/\D/g, '')
}

export function buildOrderUrl(items = [], { deliveryLocation } = {}) {
  const number = getSanitizedWhatsAppNumber()
  const total = items.reduce(
    (sum, item) => sum + (item.product?.priceKes || 0) * (item.quantity || 1),
    0
  )

  const lines = [
    'Hello Aurelle Home, I would like to order:',
    ...items.map(
      (item) =>
        `- ${item.quantity} x ${item.product.name} (${formatKes(item.product.priceKes)} each)`
    ),
    `Total: ${formatKes(total)}`,
  ]

  const trimmedLocation = deliveryLocation ? deliveryLocation.trim() : ''
  if (trimmedLocation) {
    lines.push(`Delivery location: ${trimmedLocation}`)
  }

  if (items.length === 1 && items[0]?.product?.slug) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    lines.push(`Product link: ${origin}/product/${items[0].product.slug}`)
  }

  const message = lines.join('\n')
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function buildQuestionUrl(product) {
  if (!product) return ''
  const number = getSanitizedWhatsAppNumber()
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const message = `Hello Aurelle Home, I have a question about the ${product.name}:\n${origin}/product/${product.slug}`

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function buildGeneralUrl() {
  const number = getSanitizedWhatsAppNumber()
  const message = 'Hello Aurelle Home, I would like some help.'
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function buildMessageUrl({ name, message }) {
  const number = getSanitizedWhatsAppNumber()
  const text = `Hello Aurelle Home, my name is ${name}.\n${message}`
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
