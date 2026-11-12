// Mock API. Replace with fetch calls to the FastAPI backend, using import.meta.env.VITE_API_URL.

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export async function subscribe({
  email,
  wantsNewArrivals,
  wantsHotItems,
  wantsLowStock,
  source,
}) {
  await delay(400)
  return { ok: true, verified: false }
}

export async function addFavorite(email, productId) {
  await delay(400)
  return { ok: true, verified: false }
}

export async function removeFavorite(email, productId) {
  await delay(400)
  return { ok: true, verified: false }
}

