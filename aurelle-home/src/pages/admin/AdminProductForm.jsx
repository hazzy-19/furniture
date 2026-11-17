import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addImage,
  updateImage,
  deleteImage,
  uploadImageFile,
  buildProductPayload,
  getMenu,
} from '../../lib/adminApi.js'
import usePageMeta from '../../lib/usePageMeta.js'
import { cloudinaryUrl } from '../../lib/cloudinaryUrl.js'

export default function AdminProductForm() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const routeProductId = id && id !== 'new' ? id : null
  const navigate = useNavigate()

  const [createdProductId, setCreatedProductId] = useState(null)
  const isCreatingProduct = isNew && !createdProductId

  usePageMeta({
    title: `${isCreatingProduct ? 'New product' : 'Edit product'} | Admin | Aurelle Home`,
    description: 'Admin product management form.',
    noindex: true,
  })

  const [loading, setLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState('')
  const [menuRooms, setMenuRooms] = useState([])

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    priceKes: '',
    compareAtPriceKes: '',
    categorySlug: '',
    material: '',
    color: '',
    widthCm: '',
    depthCm: '',
    heightCm: '',
    isHot: false,
    status: 'draft',
    stock: '0',
    lowStockThreshold: '3',
  })

  const [images, setImages] = useState([])
  const [selectedImageFiles, setSelectedImageFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [deleteError, setDeleteError] = useState('')
  const [imageError, setImageError] = useState('')
  const [replacingImageId, setReplacingImageId] = useState(null)

  // Load categories from the menu endpoint via hardened client
  useEffect(() => {
    getMenu()
      .then((data) => {
        if (data && data.rooms) {
          setMenuRooms(data.rooms)
        }
      })
      .catch(() => {
        // Keep the form usable if the menu endpoint is unavailable.
      })
  }, [])

  // Load an existing product
  const loadProductData = useCallback(async () => {
    if (isNew) return

    setLoading(true)
    setLoadError('')

    try {
      const data = await getProduct(id)

      setForm({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        priceKes:
          data.priceKes !== null && data.priceKes !== undefined
            ? String(data.priceKes)
            : '',
        compareAtPriceKes:
          data.compareAtPriceKes !== null && data.compareAtPriceKes !== undefined
            ? String(data.compareAtPriceKes)
            : '',
        categorySlug: data.category || data.categorySlug || '',
        material: data.material || '',
        color: data.color || '',
        widthCm:
          data.widthCm !== null && data.widthCm !== undefined
            ? String(data.widthCm)
            : '',
        depthCm:
          data.depthCm !== null && data.depthCm !== undefined
            ? String(data.depthCm)
            : '',
        heightCm:
          data.heightCm !== null && data.heightCm !== undefined
            ? String(data.heightCm)
            : '',
        isHot: Boolean(data.badge === 'hot' || data.isHot || data.is_hot),
        status: data.status || 'draft',
        stock:
          data.stock !== null && data.stock !== undefined
            ? String(data.stock)
            : '0',
        lowStockThreshold:
          data.lowStockThreshold !== null && data.lowStockThreshold !== undefined
            ? String(data.lowStockThreshold)
            : '3',
      })

      setImages(data.images || [])
    } catch (err) {
      setLoadError(err.message || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }, [id, isNew])

  useEffect(() => {
    loadProductData()
  }, [loadProductData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    const allowedTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
    ])
    const invalidFile = files.find((file) => !allowedTypes.has(file.type))

    if (invalidFile) {
      setSaveError('Choose JPEG, PNG, WebP, or AVIF image files.')
    } else {
      setSaveError('')
      setSelectedImageFiles((current) => [...current, ...files])
    }

    // Allow selecting the same file again if it was removed.
    e.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    setFieldErrors({})
    setSaveSuccess(false)

    const payload = buildProductPayload(form)

    try {
      let productId = routeProductId || createdProductId

      if (productId) {
        await updateProduct(productId, payload)
      } else {
        const created = await createProduct(payload)
        productId = created.id
        setCreatedProductId(productId)
      }

      // Upload selected files and attach them to this product.
      for (const file of selectedImageFiles) {
        const uploaded = await uploadImageFile(file, 'products')
        const savedImage = await addImage(productId, {
          url: uploaded.url,
          cloudinaryPublicId: uploaded.publicId,
          alt: form.name.trim().slice(0, 255),
        })

        setImages((current) => [...current, savedImage])
      }
      setSelectedImageFiles([])

      if (routeProductId) {
        await loadProductData()
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      } else {
        navigate(`/admin/products/${productId}`)
      }
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors)
        setSaveError('Please correct the highlighted errors.')
      } else {
        setSaveError(err.message || 'Failed to save product and images')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    setDeleteError('')

    try {
      await deleteProduct(id)
      navigate('/admin/products')
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete product')
    }
  }

  const handleSetPrimary = async (imageId) => {
    try {
      await updateImage(id, imageId, { isPrimary: true })
      await loadProductData()
    } catch (err) {
      setImageError(err.message || 'Failed to set primary image')
    }
  }

  const handleRemoveImage = async (imageId) => {
    try {
      await deleteImage(id, imageId)
      await loadProductData()
    } catch (err) {
      setImageError(err.message || 'Failed to delete image')
    }
  }

  const handleReplaceImage = async (imageId, file) => {
    if (!file) return
    const allowedTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
    ])
    if (!allowedTypes.has(file.type)) {
      setImageError('Choose a JPEG, PNG, WebP, or AVIF image.')
      return
    }

    setReplacingImageId(imageId)
    setImageError('')

    try {
      // 1. Upload replacement first
      const uploaded = await uploadImageFile(file, 'products')
      // 2. Update DB reference; backend commits DB then destroys old asset
      await updateImage(id, imageId, {
        url: uploaded.url,
        cloudinaryPublicId: uploaded.publicId,
      })
      await loadProductData()
    } catch (err) {
      setImageError(err.message || 'Failed to replace image')
    } finally {
      setReplacingImageId(null)
    }
  }

  const handleUpdateAlt = async (imageId, altText) => {
    try {
      await updateImage(id, imageId, { alt: altText })
      await loadProductData()
    } catch (err) {
      setImageError(err.message || 'Failed to update alt text')
    }
  }

  if (loading) {
    return <p className="text-sm text-ink/70">Loading product...</p>
  }

  if (loadError) {
    return (
      <div>
        <p role="alert" className="text-sm text-red-700">
          {loadError}
        </p>
        <Link
          to="/admin/products"
          className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline"
        >
          Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl text-brand-900">
          {isCreatingProduct ? 'New product' : 'Edit product'}
        </h1>
        <Link
          to="/admin/products"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          Back to products
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        {/* Name */}
        <label htmlFor="product-name" className="mt-4 block text-sm text-ink">
          Name
        </label>
        <input
          id="product-name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink"
        />
        {fieldErrors.name && (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>
        )}

        {/* Slug */}
        <label htmlFor="product-slug" className="mt-4 block text-sm text-ink">
          Slug{' '}
          <span className="text-xs text-ink/60">
            (Leave empty to create from the name)
          </span>
        </label>
        <input
          id="product-slug"
          name="slug"
          type="text"
          value={form.slug}
          onChange={handleChange}
          className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink"
        />
        {fieldErrors.slug && (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.slug}</p>
        )}

        {/* Description */}
        <label
          htmlFor="product-description"
          className="mt-4 block text-sm text-ink"
        >
          Description
        </label>
        <textarea
          id="product-description"
          name="description"
          rows={4}
          required
          value={form.description}
          onChange={handleChange}
          className="mt-1 w-full rounded-[4px] border border-brand-200 bg-white p-4 text-base text-ink"
        />
        {fieldErrors.description && (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.description}</p>
        )}

        {/* Price and compare-at price */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="product-price"
              className="mt-4 block text-sm text-ink"
            >
              Price (KES)
            </label>
            <input
              id="product-price"
              name="priceKes"
              type="number"
              min="0"
              required
              value={form.priceKes}
              onChange={handleChange}
              className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink"
            />
            {fieldErrors.priceKes && (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.priceKes}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="product-compare-at"
              className="mt-4 block text-sm text-ink"
            >
              Compare-at price (KES)
            </label>
            <input
              id="product-compare-at"
              name="compareAtPriceKes"
              type="number"
              min="0"
              value={form.compareAtPriceKes}
              onChange={handleChange}
              className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink"
            />
            {fieldErrors.compareAtPriceKes && (
              <p className="mt-1 text-xs text-red-700">
                {fieldErrors.compareAtPriceKes}
              </p>
            )}
          </div>
        </div>

        {/* Category */}
        <label
          htmlFor="product-category"
          className="mt-4 block text-sm text-ink"
        >
          Category
        </label>
        <select
          id="product-category"
          name="categorySlug"
          required
          value={form.categorySlug}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, categorySlug: e.target.value }))
          }
          className="mt-1 h-12 w-full cursor-pointer rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink"
        >
          <option value="">Select a category</option>
          {menuRooms.map((room) => (
            <optgroup key={room.id} label={room.label}>
              {(room.categories || []).map((cat) => {
                const slug = cat.path ? cat.path.split('/').pop() : cat.id

                return (
                  <option key={cat.id || slug} value={slug}>
                    {cat.label}
                  </option>
                )
              })}
            </optgroup>
          ))}
        </select>
        {fieldErrors.categorySlug && (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.categorySlug}</p>
        )}

        {/* Material and color */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="product-material"
              className="mt-4 block text-sm text-ink"
            >
              Material
            </label>
            <input
              id="product-material"
              name="material"
              type="text"
              value={form.material}
              onChange={handleChange}
              className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink"
            />
          </div>
          <div>
            <label
              htmlFor="product-color"
              className="mt-4 block text-sm text-ink"
            >
              Color
            </label>
            <input
              id="product-color"
              name="color"
              type="text"
              value={form.color}
              onChange={handleChange}
              className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink"
            />
          </div>
        </div>

        {/* Optional dimensions */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="product-width"
              className="mt-4 block text-sm text-ink"
            >
              Width cm
            </label>
            <input
              id="product-width"
              name="widthCm"
              type="number"
              min="0"
              value={form.widthCm}
              onChange={handleChange}
              className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink"
            />
          </div>
          <div>
            <label
              htmlFor="product-depth"
              className="mt-4 block text-sm text-ink"
            >
              Depth cm
            </label>
            <input
              id="product-depth"
              name="depthCm"
              type="number"
              min="0"
              value={form.depthCm}
              onChange={handleChange}
              className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink"
            />
          </div>
          <div>
            <label
              htmlFor="product-height"
              className="mt-4 block text-sm text-ink"
            >
              Height cm
            </label>
            <input
              id="product-height"
              name="heightCm"
              type="number"
              min="0"
              value={form.heightCm}
              onChange={handleChange}
              className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink"
            />
          </div>
        </div>

        {/* Hot checkbox */}
        <div className="mt-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="isHot"
              checked={form.isHot}
              onChange={handleChange}
              className="h-4 w-4 accent-brand-500"
            />
            Hot product badge
          </label>
        </div>

        {/* Status */}
        <label
          htmlFor="product-status"
          className="mt-4 block text-sm text-ink"
        >
          Status
        </label>
        <select
          id="product-status"
          name="status"
          value={form.status}
          onChange={handleChange}
          className="mt-1 h-12 w-full cursor-pointer rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        {/* Stock and low-stock threshold */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="product-stock"
              className="mt-4 block text-sm text-ink"
            >
              Stock
            </label>
            <input
              id="product-stock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink"
            />
          </div>
          <div>
            <label
              htmlFor="product-low-stock"
              className="mt-4 block text-sm text-ink"
            >
              Low-stock threshold
            </label>
            <input
              id="product-low-stock"
              name="lowStockThreshold"
              type="number"
              min="0"
              value={form.lowStockThreshold}
              onChange={handleChange}
              className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink"
            />
          </div>
        </div>

        {/* Select local images from device to attach on save */}
        <section className="mt-8 rounded-lg border border-brand-200 bg-brand-50 p-4">
          <h2 className="font-heading text-xl text-brand-900">Add product images</h2>
          <p className="mt-1 text-sm text-ink/70">
            Choose image files from your device. They upload when you save the product.
          </p>
          <input
            id="product-images"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={handleImageFileChange}
            className="sr-only"
          />
          <label
            htmlFor="product-images"
            className="mt-3 inline-flex h-10 cursor-pointer items-center rounded-[4px] border-2 border-ink px-4 text-sm font-medium text-ink hover:bg-ink hover:text-white"
          >
            Choose images from device
          </label>

          {selectedImageFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {selectedImageFiles.map((file, index) => {
                const objectUrl = URL.createObjectURL(file)
                return (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="relative overflow-hidden rounded-lg border border-brand-200 bg-white p-2"
                  >
                    <img
                      src={objectUrl}
                      alt={file.name}
                      className="h-24 w-full rounded-[4px] object-cover"
                      onLoad={() => URL.revokeObjectURL(objectUrl)}
                    />
                    <p className="mt-1 truncate text-xs text-ink">{file.name}</p>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageFiles((current) =>
                          current.filter((_, fileIndex) => fileIndex !== index),
                        )
                      }
                      className="mt-1 text-xs font-medium text-red-700 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {saveError && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {saveError}
          </p>
        )}

        {saveSuccess && (
          <p className="mt-3 text-sm font-medium text-brand-700">Saved</p>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-[4px] bg-brand-900 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>

          <Link
            to="/admin/products"
            className="inline-flex h-12 items-center justify-center rounded-[4px] border-2 border-ink px-6 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Back to products
          </Link>

          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              className="h-12 cursor-pointer rounded-[4px] border-2 border-red-700 px-6 text-sm font-medium text-red-700 hover:bg-red-700 hover:text-white"
            >
              Delete product
            </button>
          )}
        </div>

        {deleteError && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {deleteError}
          </p>
        )}
      </form>

      {/* Existing uploaded product images with in-place replace and delete */}
      {!isNew && (
        <section className="mt-12 border-t border-brand-200 pt-8">
          <h2 className="font-heading text-2xl text-brand-900">Saved product images</h2>
          <p className="mt-1 text-xs text-ink/60">
            Each image can be replaced from your device, marked primary, or deleted.
          </p>

          {imageError && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {imageError}
            </p>
          )}

          {images.length > 0 ? (
            <div className="mt-4 divide-y divide-brand-200 border-y border-brand-200">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={cloudinaryUrl(img.url, 200)}
                      alt={img.alt || ''}
                      loading="lazy"
                      decoding="async"
                      className="h-20 w-20 shrink-0 rounded-[4px] border border-brand-200 bg-brand-200 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-mono text-ink/70">
                        {img.url}
                      </p>
                      <input
                        type="text"
                        defaultValue={img.alt || ''}
                        placeholder="Alt text"
                        onBlur={(e) => {
                          if (e.target.value !== img.alt) {
                            handleUpdateAlt(img.id, e.target.value)
                          }
                        }}
                        className="mt-1 h-8 w-full max-w-xs rounded-[4px] border border-brand-200 bg-white px-2 text-xs text-ink"
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ink">
                      <input
                        type="radio"
                        name="primaryImage"
                        checked={Boolean(img.isPrimary ?? img.is_primary)}
                        onChange={() => handleSetPrimary(img.id)}
                        className="h-4 w-4 accent-brand-500"
                      />
                      Primary
                    </label>

                    {/* In-place image replacement file picker */}
                    <input
                      id={`replace-img-${img.id}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={(e) =>
                        handleReplaceImage(img.id, e.target.files?.[0])
                      }
                      className="sr-only"
                    />
                    <label
                      htmlFor={`replace-img-${img.id}`}
                      className="cursor-pointer text-xs font-semibold text-brand-700 hover:underline"
                    >
                      {replacingImageId === img.id ? 'Uploading...' : 'Replace image'}
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="cursor-pointer text-xs font-medium text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink/60">No images added yet.</p>
          )}
        </section>
      )}
    </div>
  )
}
