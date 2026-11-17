// Admin API client using httpOnly cookie session authentication

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

export async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const requestHeaders = { ...headers }

  if (body !== undefined && body !== null) {
    if (!requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json'
    }
  }

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: 'include',
      headers: requestHeaders,
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    // Network failure when fetch throws
    const netErr = new Error('Cannot reach the server. Check your connection and try again.')
    netErr.status = 0
    throw netErr
  }

  // 204: return null, never call res.json()
  if (res.status === 204) {
    return null
  }

  if (!res.ok) {
    let errBody = null
    try {
      errBody = await res.json()
    } catch {
      // Body is not JSON or is empty.
    }

    // 401: throw an error with status 401 so the admin shell shows the login form
    if (res.status === 401) {
      const message =
        (errBody && typeof errBody.detail === 'string' && errBody.detail) ||
        'Authentication required.'
      const err = new Error(message)
      err.status = 401
      throw err
    }

    // 403: throw an error with forbidden message
    if (res.status === 403) {
      const err = new Error('You do not have permission to do this.')
      err.status = 403
      throw err
    }

    // 422: FastAPI returns { detail: [{ loc: ["body","priceKes"], msg }] }
    // Convert to an object { priceKes: "msg" } using the last item of loc as the key.
    if (res.status === 422) {
      const fieldErrors = {}
      if (errBody && Array.isArray(errBody.detail)) {
        for (const item of errBody.detail) {
          if (Array.isArray(item.loc) && item.loc.length > 0) {
            const key = item.loc[item.loc.length - 1]
            fieldErrors[key] = item.msg || 'Invalid value'
          }
        }
      }
      const message =
        Object.values(fieldErrors)[0] ||
        (errBody && typeof errBody.detail === 'string' && errBody.detail) ||
        'Validation failed'
      const err = new Error(message)
      err.status = 422
      err.fieldErrors = fieldErrors
      throw err
    }

    let message = 'Something went wrong'
    if (errBody && errBody.detail) {
      if (typeof errBody.detail === 'string') {
        message = errBody.detail
      } else if (Array.isArray(errBody.detail)) {
        message = errBody.detail
          .map((detail) => detail.msg || JSON.stringify(detail))
          .join(', ')
      } else {
        message = JSON.stringify(errBody.detail)
      }
    }

    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return res.json()
}

// Product form payload builder used for create and update.
// Sends ONLY the 15 valid fields to avoid 422 rejection on unknown keys.
export function buildProductPayload(form) {
  const parseNumOrNull = (val) => {
    if (val === '' || val === null || val === undefined) return null
    const num = Number(val)
    return isNaN(num) ? null : num
  }

  const parseStringOrNull = (val) => {
    if (val === null || val === undefined) return null
    const trimmed = String(val).trim()
    return trimmed === '' ? null : trimmed
  }

  const parseRequiredNum = (val, fallback = 0) => {
    if (val === '' || val === null || val === undefined) return fallback
    const num = Number(val)
    return isNaN(num) ? fallback : num
  }

  return {
    name: String(form.name || '').trim(),
    slug: parseStringOrNull(form.slug),
    description: String(form.description || '').trim(),
    priceKes: parseRequiredNum(form.priceKes, 0),
    compareAtPriceKes: parseNumOrNull(form.compareAtPriceKes),
    categorySlug: String(form.categorySlug || '').trim(),
    material: parseStringOrNull(form.material),
    color: parseStringOrNull(form.color),
    widthCm: parseNumOrNull(form.widthCm),
    depthCm: parseNumOrNull(form.depthCm),
    heightCm: parseNumOrNull(form.heightCm),
    isHot: Boolean(form.isHot),
    status: form.status || 'draft',
    stock: parseRequiredNum(form.stock, 0),
    lowStockThreshold: parseRequiredNum(form.lowStockThreshold, 3),
  }
}

export function login(email, password) {
  return request('/api/admin/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function logout() {
  return request('/api/admin/logout', {
    method: 'POST',
  })
}

export function me() {
  return request('/api/admin/me')
}

export function listProducts({ status, search } = {}) {
  const params = new URLSearchParams()

  if (status) params.set('status', status)
  if (search) params.set('search', search)

  const queryString = params.toString()
  return request(`/api/admin/products${queryString ? `?${queryString}` : ''}`)
}

export function getProduct(id) {
  return request(`/api/admin/products/${id}`)
}

export function createProduct(data) {
  const payload = data && data.name !== undefined ? buildProductPayload(data) : data
  return request('/api/admin/products', {
    method: 'POST',
    body: payload,
  })
}

export function updateProduct(id, data) {
  const payload =
    data && data.name !== undefined && data.categorySlug !== undefined
      ? buildProductPayload(data)
      : data
  return request(`/api/admin/products/${id}`, {
    method: 'PATCH',
    body: payload,
  })
}

export function deleteProduct(id) {
  return request(`/api/admin/products/${id}`, {
    method: 'DELETE',
  })
}

export function addImage(id, data) {
  return request(`/api/admin/products/${id}/images`, {
    method: 'POST',
    body: data,
  })
}

export function updateImage(id, imageId, data) {
  return request(`/api/admin/products/${id}/images/${imageId}`, {
    method: 'PATCH',
    body: data,
  })
}

export function deleteImage(id, imageId) {
  return request(`/api/admin/products/${id}/images/${imageId}`, {
    method: 'DELETE',
  })
}

export function getMenu() {
  return request('/api/menu')
}

export function listAdminCategories() {
  return request('/api/admin/content/categories')
}

export function createAdminCategory(payload) {
  return request('/api/admin/content/categories', {
    method: 'POST',
    body: payload,
  })
}

export function updateAdminCategory(id, payload) {
  return request(`/api/admin/content/categories/${id}`, {
    method: 'PATCH',
    body: payload,
  })
}

export function deleteAdminCategory(id) {
  return request(`/api/admin/content/categories/${id}`, {
    method: 'DELETE',
  })
}

export function getAdminHero() {
  return request('/api/admin/content/hero')
}

export function saveAdminHero(payload) {
  return request('/api/admin/content/hero', {
    method: 'PUT',
    body: payload,
  })
}

export async function uploadImageFile(file, purpose = 'products') {
  const signed = await request('/api/admin/uploads/signature', {
    method: 'POST',
    body: { purpose },
  })

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', signed.apiKey)
  formData.append('timestamp', String(signed.timestamp))
  formData.append('folder', signed.folder)
  formData.append('signature', signed.signature)

  let response
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    )
  } catch (err) {
    throw new Error('Cannot reach the image upload server. Check your connection and try again.')
  }

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result?.error?.message || 'Image upload failed')
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

export function destroyImage(publicId) {
  if (!publicId) return Promise.resolve(null)
  return request('/api/admin/uploads/destroy', {
    method: 'POST',
    body: { publicId },
  })
}