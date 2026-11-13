const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000'
).replace(/\/$/, '')

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/api/products`)

  if (!response.ok) {
    throw new Error(`Could not load products (${response.status}).`)
  }

  return response.json()
}

export async function getProduct(slug) {
  const response = await fetch(
    `${API_BASE_URL}/api/products/${encodeURIComponent(slug)}`
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Could not load product (${response.status}).`)
  }

  return response.json()
}

export async function getHero() {
  const response = await fetch(`${API_BASE_URL}/api/hero`)

  if (!response.ok) {
    throw new Error(`Could not load homepage hero (${response.status}).`)
  }

  return response.json()
}

export async function getPromos() {
  const response = await fetch(`${API_BASE_URL}/api/promos`)

  if (!response.ok) {
    throw new Error(`Could not load promotions (${response.status}).`)
  }

  return response.json()
}

export async function getMenu() {
  const response = await fetch(`${API_BASE_URL}/api/menu`)

  if (!response.ok) {
    throw new Error(`Could not load menu (${response.status}).`)
  }

  return response.json()
}

export async function subscribe(payload) {
  const response = await fetch(`${API_BASE_URL}/api/subscribers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    const message =
      typeof data.detail === 'string'
        ? data.detail
        : `Could not save subscription (${response.status}).`

    throw new Error(message)
  }

  return data
}

export async function addFavorite(email, productId) {
  await delay(400)
  return { ok: true, verified: false }
}

export async function removeFavorite(email, productId) {
  await delay(400)
  return { ok: true, verified: false }
}