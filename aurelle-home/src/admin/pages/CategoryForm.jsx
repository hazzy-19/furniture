import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Image as ImageIcon, Upload } from 'lucide-react'
import Icon from '../../components/Icon.jsx'
import {
  createAdminCategory,
  getAdminCategory,
  listAdminCategories,
  listProducts,
  updateAdminCategory,
  uploadImageFile,
} from '../../lib/adminApi.js'
import { cloudinaryUrl } from '../../lib/cloudinaryUrl.js'
import usePageMeta from '../../lib/usePageMeta.js'

function slugifyPreview(text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function CategoryForm({ categoryId: propId, onSaveSuccess }) {
  const { id: routeId } = useParams()
  const id = propId || (routeId && routeId !== 'new' ? routeId : null)
  const isNew = !id
  const navigate = useNavigate()

  usePageMeta({
    title: `${isNew ? 'New category' : 'Edit category'} | Admin | Aurelle Home`,
    description: 'Category management form.',
    noindex: true,
  })

  const [loading, setLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState('')

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [parentId, setParentId] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [blurb, setBlurb] = useState('')
  const [featuredProductId, setFeaturedProductId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Load existing categories and products for select dropdowns
  useEffect(() => {
    listAdminCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))

    listProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
  }, [])

  // Load existing category details when editing
  const loadCategory = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setLoadError('')

    try {
      const data = await getAdminCategory(id)
      setName(data.name || '')
      setSlug(data.slug || '')
      setParentId(data.parentId || '')
      setSortOrder(String(data.sortOrder ?? 0))
      setBlurb(data.blurb || '')
      setFeaturedProductId(data.featuredProductId || '')
      setImageUrl(data.imageUrl || '')
      setCloudinaryPublicId(data.cloudinaryPublicId || '')
    } catch (err) {
      setLoadError(err.message || 'Failed to load category.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadCategory()
  }, [loadCategory])

  // Collect descendants so category cannot select itself or its children as parent
  const descendantIds = useMemo(() => {
    if (!id) return new Set()
    const set = new Set()
    function findChildren(pid) {
      for (const cat of categories) {
        if (cat.parentId === pid && !set.has(cat.id)) {
          set.add(cat.id)
          findChildren(cat.id)
        }
      }
    }
    findChildren(id)
    return set
  }, [id, categories])

  const eligibleParents = useMemo(() => {
    return categories.filter((cat) => cat.id !== id && !descendantIds.has(cat.id))
  }, [categories, id, descendantIds])

  const autoSlugPreview = slugifyPreview(name)

  const handleFieldChange = (setter, fieldName) => (e) => {
    setter(e.target.value)
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[fieldName]
        return next
      })
    }
  }

  // Handle image upload through Cloudinary upload signature
  const handleUploadFile = async (file) => {
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!allowed.includes(file.type)) {
      setUploadError('Please select a JPEG, PNG, WebP, or AVIF image.')
      return
    }

    setUploadingImage(true)
    setUploadError('')

    try {
      const uploaded = await uploadImageFile(file, 'categories')
      setImageUrl(uploaded.url)
      setCloudinaryPublicId(uploaded.publicId)

      // If category already exists, immediately patch it to persist the image
      if (id) {
        await updateAdminCategory(id, {
          imageUrl: uploaded.url,
          cloudinaryPublicId: uploaded.publicId,
        })
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload category image.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUploadFile(file)
    }
    e.target.value = ''
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUploadFile(file)
    }
  }

  const handleRemoveImage = async () => {
    setImageUrl('')
    setCloudinaryPublicId('')
    if (id) {
      try {
        await updateAdminCategory(id, {
          imageUrl: null,
          cloudinaryPublicId: null,
        })
      } catch (err) {
        setUploadError(err.message || 'Failed to remove image.')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    setFieldErrors({})
    setSaveSuccess(false)

    const payload = {
      name: name.trim(),
      slug: slug.trim() || null,
      parentId: parentId || null,
      sortOrder: Number(sortOrder) || 0,
      blurb: blurb.trim() || null,
      featuredProductId: featuredProductId || null,
      imageUrl: imageUrl || null,
      cloudinaryPublicId: cloudinaryPublicId || null,
    }

    try {
      if (id) {
        await updateAdminCategory(id, payload)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
        if (onSaveSuccess) onSaveSuccess()
      } else {
        const created = await createAdminCategory(payload)
        if (onSaveSuccess) {
          onSaveSuccess(created)
        } else {
          navigate('/admin/categories')
        }
      }
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors)
        setSaveError('Please correct the highlighted errors.')
      } else {
        setSaveError(err.message || 'Failed to save category.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-ink/70">Loading category...</div>
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </div>
        <Link
          to="/admin/categories"
          className="inline-flex h-10 items-center justify-center rounded-[4px] border-2 border-ink px-4 text-sm font-medium text-ink hover:bg-ink hover:text-white"
        >
          Back to categories
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-brand-900">
            {isNew ? 'New category' : `Edit category: ${name}`}
          </h1>
          <p className="mt-1 text-sm text-ink/70">
            {isNew
              ? 'Create a top-level category or a subcategory.'
              : 'Update category details, parent hierarchy, and storefront image.'}
          </p>
        </div>
        <Link
          to="/admin/categories"
          className="inline-flex h-10 items-center justify-center rounded-[4px] border-2 border-ink px-4 text-sm font-medium text-ink hover:bg-ink hover:text-white"
        >
          Back to list
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {saveError && (
          <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div role="status" className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm font-medium text-brand-700">
            Category saved successfully.
          </div>
        )}

        {/* Basic fields card */}
        <section className="rounded-lg border border-brand-200 bg-white p-6 space-y-4">
          <div>
            <label htmlFor="category-name" className="block text-sm font-medium text-ink">
              Category name <span className="text-red-700">*</span>
            </label>
            <input
              id="category-name"
              type="text"
              required
              value={name}
              onChange={handleFieldChange(setName, 'name')}
              placeholder="e.g. Living room, Sofas"
              className={`mt-1 h-12 w-full rounded-[4px] border px-4 text-base text-ink focus:outline-none ${
                fieldErrors.name ? 'border-red-700' : 'border-brand-200 focus:border-brand-500'
              }`}
            />
            {fieldErrors.name && (
              <p role="alert" className="mt-1 text-xs text-red-700">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="category-slug" className="block text-sm font-medium text-ink">
              Slug <span className="text-xs text-ink/50">(optional, lowercase and hyphens)</span>
            </label>
            <input
              id="category-slug"
              type="text"
              value={slug}
              onChange={handleFieldChange(setSlug, 'slug')}
              placeholder={autoSlugPreview || 'auto-generated-from-name'}
              className={`mt-1 h-12 w-full rounded-[4px] border px-4 text-base text-ink focus:outline-none ${
                fieldErrors.slug ? 'border-red-700' : 'border-brand-200 focus:border-brand-500'
              }`}
            />
            {!slug && (
              <p className="mt-1 text-xs text-ink/50">
                Preview: {autoSlugPreview || 'slug-preview'}
              </p>
            )}
            {fieldErrors.slug && (
              <p role="alert" className="mt-1 text-xs text-red-700">
                {fieldErrors.slug}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category-parent" className="block text-sm font-medium text-ink">
                Parent category
              </label>
              <select
                id="category-parent"
                value={parentId}
                onChange={handleFieldChange(setParentId, 'parentId')}
                className="mt-1 h-12 w-full cursor-pointer rounded-[4px] border border-brand-200 bg-white px-3 text-base text-ink focus:border-brand-500 focus:outline-none"
              >
                <option value="">None (Top-level category)</option>
                {eligibleParents.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {fieldErrors.parentId && (
                <p role="alert" className="mt-1 text-xs text-red-700">
                  {fieldErrors.parentId}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="category-sort-order" className="block text-sm font-medium text-ink">
                Sort order
              </label>
              <input
                id="category-sort-order"
                type="number"
                value={sortOrder}
                onChange={handleFieldChange(setSortOrder, 'sortOrder')}
                className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base text-ink focus:border-brand-500 focus:outline-none"
              />
              {fieldErrors.sortOrder && (
                <p role="alert" className="mt-1 text-xs text-red-700">
                  {fieldErrors.sortOrder}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="category-blurb" className="block text-sm font-medium text-ink">
              Blurb <span className="text-xs text-ink/50">(storefront description)</span>
            </label>
            <textarea
              id="category-blurb"
              rows={3}
              value={blurb}
              onChange={handleFieldChange(setBlurb, 'blurb')}
              placeholder="Short description displayed on storefront cards"
              className="mt-1 w-full rounded-[4px] border border-brand-200 bg-white p-3 text-base text-ink focus:border-brand-500 focus:outline-none"
            />
            {fieldErrors.blurb && (
              <p role="alert" className="mt-1 text-xs text-red-700">
                {fieldErrors.blurb}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="category-featured-product" className="block text-sm font-medium text-ink">
              Featured product <span className="text-xs text-ink/50">(highlighted in mega-menu)</span>
            </label>
            <select
              id="category-featured-product"
              value={featuredProductId}
              onChange={handleFieldChange(setFeaturedProductId, 'featuredProductId')}
              className="mt-1 h-12 w-full cursor-pointer rounded-[4px] border border-brand-200 bg-white px-3 text-base text-ink focus:border-brand-500 focus:outline-none"
            >
              <option value="">None</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.slug})
                </option>
              ))}
            </select>
            {fieldErrors.featuredProductId && (
              <p role="alert" className="mt-1 text-xs text-red-700">
                {fieldErrors.featuredProductId}
              </p>
            )}
          </div>
        </section>

        {/* Image Drop Zone */}
        <section className="rounded-lg border border-brand-200 bg-white p-6 space-y-4">
          <div>
            <h2 className="font-heading text-xl text-brand-900">Category image</h2>
            <p className="mt-1 text-sm text-ink/70">
              Drag and drop an image or pick a file. Automatically optimized on upload.
            </p>
          </div>

          {imageUrl ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border border-brand-200 bg-brand-50 p-4">
              <img
                src={cloudinaryUrl(imageUrl, 200)}
                alt={name ? `${name} thumbnail` : 'Category image'}
                className="h-24 w-24 rounded-[4px] border border-brand-200 bg-white object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-mono text-ink/70">{imageUrl}</p>
                <div className="mt-3 flex gap-3">
                  <label
                    htmlFor="category-image-replace"
                    className="cursor-pointer text-xs font-semibold text-brand-700 hover:underline"
                  >
                    {uploadingImage ? 'Uploading...' : 'Replace image'}
                  </label>
                  <input
                    id="category-image-replace"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={uploadingImage}
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="cursor-pointer text-xs font-medium text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? 'border-brand-500 bg-brand-100/50'
                  : 'border-brand-200 bg-brand-50 hover:bg-brand-100/30'
              }`}
            >
              <Icon icon={Upload} size={32} className="text-brand-700" />
              <p className="mt-2 text-sm font-medium text-ink">
                {uploadingImage ? 'Uploading image...' : 'Drag and drop an image here, or choose from device'}
              </p>
              <p className="mt-1 text-xs text-ink/60">
                Supports JPEG, PNG, WebP, and AVIF
              </p>

              <input
                id="category-image-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={uploadingImage}
                onChange={handleFileSelect}
                className="sr-only"
              />
              <label
                htmlFor="category-image-input"
                className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-[4px] border-2 border-ink px-4 text-xs font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
              >
                {uploadingImage ? 'Uploading...' : 'Choose file'}
              </label>
            </div>
          )}

          {uploadError && (
            <p role="alert" className="text-xs text-red-700">
              {uploadError}
            </p>
          )}
        </section>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-[4px] bg-brand-900 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : isNew ? 'Create category' : 'Save changes'}
          </button>
          <Link
            to="/admin/categories"
            className="inline-flex h-12 items-center justify-center rounded-[4px] border-2 border-ink px-6 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
