// Admin API client using httpOnly cookie session authentication

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function request(path, { method = 'GET', body } = {}) {
  const headers = body ? { 'Content-Type': 'application/json' } : {}

  const res = await fetch(`${API}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let message = 'Something went wrong'

    try {
      const errData = await res.json()

      if (errData && errData.detail) {
        if (typeof errData.detail === 'string') {
          message = errData.detail
        } else if (Array.isArray(errData.detail)) {
          message = errData.detail
            .map((detail) => detail.msg || JSON.stringify(detail))
            .join(', ')
        } else {
          message = JSON.stringify(errData.detail)
        }
      }
    } catch {
      // Body is not JSON or is empty.
    }

    const err = new Error(message)
    err.status = res.status
    throw err
  }

  if (res.status === 204) {
    return null
  }

  return res.json()
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
  return request('/api/admin/products', {
    method: 'POST',
    body: data,
  })
}

export function updateProduct(id, data) {
  return request(`/api/admin/products/${id}`, {
    method: 'PATCH',
    body: data,
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

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result?.error?.message || 'Image upload failed')
  }

  return {
    url: result.secure_url.replace('/upload/', '/upload/f_webp,q_auto/'),
  }
}