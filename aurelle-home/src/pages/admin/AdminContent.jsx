import { useCallback, useEffect, useState } from 'react'
import usePageMeta from '../../lib/usePageMeta.js'
import AdminImageSlot from '../../components/admin/AdminImageSlot.jsx'
import { cloudinaryUrl } from '../../lib/cloudinaryUrl.js'
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminHero,
  listAdminCategories,
  saveAdminHero,
  updateAdminCategory,
  uploadImageFile,
} from '../../lib/adminApi.js'

const EMPTY_CATEGORY = {
  name: '',
  slug: '',
  blurb: '',
  parentSlug: '',
  sortOrder: '0',
  imageUrl: '',
  cloudinaryPublicId: null,
}

const EMPTY_HERO = {
  eyebrow: '',
  headlineDesktop: '',
  headlineMobile: '',
  subtext: '',
  ctaLabelDesktop: 'Shop now',
  ctaLabelMobile: 'Shop now',
  ctaPath: '/shop/living-room',
  badge: '',
  imageDesktop: '',
  imageMobile: '',
  cloudinaryPublicIdDesktop: null,
  cloudinaryPublicIdMobile: null,
  isActive: true,
}

function heroFormFromResponse(hero) {
  if (!hero) return { ...EMPTY_HERO }

  return {
    eyebrow: hero.eyebrow || '',
    headlineDesktop: hero.headlineDesktop || '',
    headlineMobile: hero.headlineMobile || '',
    subtext: hero.subtext || '',
    ctaLabelDesktop: hero.ctaLabelDesktop || 'Shop now',
    ctaLabelMobile: hero.ctaLabelMobile || 'Shop now',
    ctaPath: hero.ctaPath || '/shop/living-room',
    badge: hero.badge || '',
    imageDesktop: hero.imageDesktop || '',
    imageMobile: hero.imageMobile || '',
    cloudinaryPublicIdDesktop: hero.cloudinaryPublicIdDesktop || null,
    cloudinaryPublicIdMobile: hero.cloudinaryPublicIdMobile || null,
    isActive: Boolean(hero.isActive),
  }
}

export default function AdminContent() {
  usePageMeta({
    title: 'Content | Admin | Aurelle Home',
    description: 'Edit homepage hero and storefront categories.',
    noindex: true,
  })

  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState('')
  const [categoryForm, setCategoryForm] = useState({ ...EMPTY_CATEGORY })
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [categoryImageFile, setCategoryImageFile] = useState(null)
  const [categorySaving, setCategorySaving] = useState(false)
  const [categoryMessage, setCategoryMessage] = useState('')

  const [heroForm, setHeroForm] = useState({ ...EMPTY_HERO })
  const [heroLoading, setHeroLoading] = useState(true)
  const [heroError, setHeroError] = useState('')
  const [heroSaving, setHeroSaving] = useState(false)
  const [heroMessage, setHeroMessage] = useState('')
  const [heroDesktopFile, setHeroDesktopFile] = useState(null)
  const [heroMobileFile, setHeroMobileFile] = useState(null)

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true)
    setCategoriesError('')

    try {
      const data = await listAdminCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      setCategoriesError(error.message || 'Could not load categories.')
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  const loadHero = useCallback(async () => {
    setHeroLoading(true)
    setHeroError('')

    try {
      const data = await getAdminHero()
      setHeroForm(heroFormFromResponse(data))
    } catch (error) {
      setHeroError(error.message || 'Could not load hero content.')
    } finally {
      setHeroLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
    loadHero()
  }, [loadCategories, loadHero])

  const beginNewCategory = (parentSlug = '') => {
    setEditingCategoryId(null)
    setCategoryForm({ ...EMPTY_CATEGORY, parentSlug })
    setCategoryImageFile(null)
    setCategoryMessage('')
    setCategoriesError('')
  }

  const beginEditCategory = (category) => {
    setEditingCategoryId(category.id)
    setCategoryForm({
      name: category.name || '',
      slug: category.slug || '',
      blurb: category.blurb || '',
      parentSlug: category.parentSlug || '',
      sortOrder: String(category.sortOrder ?? 0),
      imageUrl: category.imageUrl || '',
      cloudinaryPublicId: category.cloudinaryPublicId || null,
    })
    setCategoryImageFile(null)
    setCategoryMessage('')
    setCategoriesError('')
  }

  const handleCategoryChange = (event) => {
    const { name, value } = event.target
    setCategoryForm((current) => ({ ...current, [name]: value }))
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault()
    setCategorySaving(true)
    setCategoriesError('')
    setCategoryMessage('')

    try {
      let imageUrl = categoryForm.imageUrl || null
      let cloudinaryPublicId = categoryForm.cloudinaryPublicId || null

      if (categoryImageFile) {
        const uploaded = await uploadImageFile(categoryImageFile, 'categories')
        imageUrl = uploaded.url
        cloudinaryPublicId = uploaded.publicId
      }

      const payload = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim(),
        blurb: categoryForm.blurb.trim() || null,
        imageUrl,
        cloudinaryPublicId,
        parentSlug: categoryForm.parentSlug || null,
        sortOrder: Number(categoryForm.sortOrder || 0),
      }

      if (editingCategoryId) {
        await updateAdminCategory(editingCategoryId, payload)
      } else {
        await createAdminCategory(payload)
      }

      await loadCategories()
      beginNewCategory()
      setCategoryMessage('Category saved.')
    } catch (error) {
      setCategoriesError(error.message || 'Could not save category.')
    } finally {
      setCategorySaving(false)
    }
  }

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
      'Delete ' + category.name + '? Categories with products or subcategories cannot be deleted.',
    )
    if (!confirmed) return

    setCategoriesError('')
    setCategoryMessage('')

    try {
      await deleteAdminCategory(category.id)
      await loadCategories()
      if (editingCategoryId === category.id) beginNewCategory()
      setCategoryMessage('Category deleted.')
    } catch (error) {
      setCategoriesError(error.message || 'Could not delete category.')
    }
  }

  const handleHeroChange = (event) => {
    const { name, value, type, checked } = event.target
    setHeroForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleHeroSubmit = async (event) => {
    event.preventDefault()
    setHeroSaving(true)
    setHeroError('')
    setHeroMessage('')

    try {
      let imageDesktop = heroForm.imageDesktop
      let cloudinaryPublicIdDesktop = heroForm.cloudinaryPublicIdDesktop
      let imageMobile = heroForm.imageMobile
      let cloudinaryPublicIdMobile = heroForm.cloudinaryPublicIdMobile

      if (heroDesktopFile) {
        const uploaded = await uploadImageFile(heroDesktopFile, 'hero')
        imageDesktop = uploaded.url
        cloudinaryPublicIdDesktop = uploaded.publicId
      }
      if (heroMobileFile) {
        const uploaded = await uploadImageFile(heroMobileFile, 'hero')
        imageMobile = uploaded.url
        cloudinaryPublicIdMobile = uploaded.publicId
      }

      const saved = await saveAdminHero({
        ...heroForm,
        eyebrow: heroForm.eyebrow.trim() || null,
        subtext: heroForm.subtext.trim() || null,
        badge: heroForm.badge.trim() || null,
        imageDesktop,
        cloudinaryPublicIdDesktop,
        imageMobile,
        cloudinaryPublicIdMobile,
      })

      setHeroForm(heroFormFromResponse(saved))
      setHeroDesktopFile(null)
      setHeroMobileFile(null)
      setHeroMessage('Hero content saved.')
    } catch (error) {
      setHeroError(error.message || 'Could not save hero content.')
    } finally {
      setHeroSaving(false)
    }
  }

  const topLevelCategories = categories.filter((category) => !category.parentId)

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-heading text-3xl text-brand-900">Storefront content</h1>
        <p className="mt-2 text-sm text-ink/70">
          Edit the homepage hero, category cards, and subcategory menu images.
        </p>
      </div>

      <section className="rounded-lg border border-brand-200 bg-white p-4 md:p-6">
        <h2 className="font-heading text-2xl text-brand-900">Homepage hero</h2>
        {heroLoading ? (
          <p className="mt-4 text-sm text-ink/70">Loading hero content...</p>
        ) : (
          <form onSubmit={handleHeroSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="hero-eyebrow" className="block text-sm text-ink">Eyebrow</label>
                <input id="hero-eyebrow" name="eyebrow" value={heroForm.eyebrow} onChange={handleHeroChange} className="mt-1 h-11 w-full rounded-[4px] border border-brand-200 px-3 text-base text-ink" />
              </div>
              <div>
                <label htmlFor="hero-badge" className="block text-sm text-ink">Badge</label>
                <input id="hero-badge" name="badge" value={heroForm.badge} onChange={handleHeroChange} className="mt-1 h-11 w-full rounded-[4px] border border-brand-200 px-3 text-base text-ink" />
              </div>
            </div>

            <div>
              <label htmlFor="hero-headline-desktop" className="block text-sm text-ink">Desktop headline</label>
              <input id="hero-headline-desktop" name="headlineDesktop" required maxLength={300} value={heroForm.headlineDesktop} onChange={handleHeroChange} className="mt-1 h-11 w-full rounded-[4px] border border-brand-200 px-3 text-base text-ink" />
            </div>
            <div>
              <label htmlFor="hero-headline-mobile" className="block text-sm text-ink">Mobile headline</label>
              <input id="hero-headline-mobile" name="headlineMobile" required maxLength={300} value={heroForm.headlineMobile} onChange={handleHeroChange} className="mt-1 h-11 w-full rounded-[4px] border border-brand-200 px-3 text-base text-ink" />
            </div>
            <div>
              <label htmlFor="hero-subtext" className="block text-sm text-ink">Subtext</label>
              <textarea id="hero-subtext" name="subtext" rows={3} value={heroForm.subtext} onChange={handleHeroChange} className="mt-1 w-full rounded-[4px] border border-brand-200 p-3 text-base text-ink" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="hero-cta-desktop" className="block text-sm text-ink">Desktop button label</label>
                <input id="hero-cta-desktop" name="ctaLabelDesktop" required maxLength={120} value={heroForm.ctaLabelDesktop} onChange={handleHeroChange} className="mt-1 h-11 w-full rounded-[4px] border border-brand-200 px-3 text-base text-ink" />
              </div>
              <div>
                <label htmlFor="hero-cta-mobile" className="block text-sm text-ink">Mobile button label</label>
                <input id="hero-cta-mobile" name="ctaLabelMobile" required maxLength={120} value={heroForm.ctaLabelMobile} onChange={handleHeroChange} className="mt-1 h-11 w-full rounded-[4px] border border-brand-200 px-3 text-base text-ink" />
              </div>
            </div>
            <div>
              <label htmlFor="hero-cta-path" className="block text-sm text-ink">Button destination path</label>
              <input id="hero-cta-path" name="ctaPath" required maxLength={2048} value={heroForm.ctaPath} onChange={handleHeroChange} placeholder="/shop/living-room" className="mt-1 h-11 w-full rounded-[4px] border border-brand-200 px-3 text-base text-ink" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AdminImageSlot
                id="hero-desktop-image"
                label="Desktop hero image"
                imageUrl={heroForm.imageDesktop}
                selectedFile={heroDesktopFile}
                onSelectFile={setHeroDesktopFile}
                onClearFile={() => setHeroDesktopFile(null)}
                onRemoveImage={() =>
                  setHeroForm((current) => ({
                    ...current,
                    imageDesktop: '',
                    cloudinaryPublicIdDesktop: null,
                  }))
                }
                helpText="Select a file to replace the desktop hero image."
                previewClass="h-44 w-full"
              />
              <AdminImageSlot
                id="hero-mobile-image"
                label="Mobile hero image"
                imageUrl={heroForm.imageMobile}
                selectedFile={heroMobileFile}
                onSelectFile={setHeroMobileFile}
                onClearFile={() => setHeroMobileFile(null)}
                onRemoveImage={() =>
                  setHeroForm((current) => ({
                    ...current,
                    imageMobile: '',
                    cloudinaryPublicIdMobile: null,
                  }))
                }
                helpText="Select a file to replace the mobile hero image."
                previewClass="h-44 w-full"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" name="isActive" checked={heroForm.isActive} onChange={handleHeroChange} className="h-4 w-4 accent-brand-500" />
              Hero is active
            </label>

            {heroError && <p role="alert" className="text-sm text-red-700">{heroError}</p>}
            {heroMessage && <p role="status" className="text-sm font-medium text-brand-700">{heroMessage}</p>}
            <button type="submit" disabled={heroSaving} className="h-11 rounded-[4px] bg-brand-900 px-5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 cursor-pointer">
              {heroSaving ? 'Uploading and saving...' : 'Save hero content'}
            </button>
          </form>
        )}
      </section>

      <section className="rounded-lg border border-brand-200 bg-white p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl text-brand-900">Categories and subcategories</h2>
            <p className="mt-1 text-sm text-ink/70">Top-level categories supply the homepage cards. Subcategories supply the menu links.</p>
          </div>
          <button type="button" onClick={() => beginNewCategory()} className="h-10 rounded-[4px] bg-brand-900 px-4 text-sm font-medium text-white hover:bg-brand-700 cursor-pointer">
            Add top-level category
          </button>
        </div>

        <form onSubmit={handleCategorySubmit} className="mt-6 rounded-lg border border-brand-200 bg-brand-50 p-4">
          <h3 className="font-heading text-xl text-brand-900">
            {editingCategoryId ? 'Edit category' : categoryForm.parentSlug ? 'Add subcategory' : 'Add top-level category'}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category-name" className="block text-sm text-ink">Name</label>
              <input id="category-name" name="name" required maxLength={160} value={categoryForm.name} onChange={handleCategoryChange} className="mt-1 h-11 w-full rounded-[4px] border border-brand-200 bg-white px-3 text-base text-ink" />
            </div>
            <div>
              <label htmlFor="category-slug" className="block text-sm text-ink">Slug</label>
              <input id="category-slug" name="slug" required maxLength={180} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={categoryForm.slug} onChange={handleCategoryChange} className="mt-1 h-11 w-full rounded-[4px] border border-brand-200 bg-white px-3 text-base text-ink" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category-parent" className="block text-sm text-ink">Parent category</label>
              <select id="category-parent" name="parentSlug" value={categoryForm.parentSlug} onChange={handleCategoryChange} className="mt-1 h-11 w-full cursor-pointer rounded-[4px] border border-brand-200 bg-white px-3 text-base text-ink">
                <option value="">Top-level category</option>
                {topLevelCategories.filter((category) => category.id !== editingCategoryId).map((category) => (
                  <option key={category.id} value={category.slug}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category-sort-order" className="block text-sm text-ink">Sort order</label>
              <input id="category-sort-order" name="sortOrder" type="number" value={categoryForm.sortOrder} onChange={handleCategoryChange} className="mt-1 h-11 w-full rounded-[4px] border border-brand-200 bg-white px-3 text-base text-ink" />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="category-blurb" className="block text-sm text-ink">Blurb</label>
            <textarea id="category-blurb" name="blurb" maxLength={2000} rows={3} value={categoryForm.blurb} onChange={handleCategoryChange} className="mt-1 w-full rounded-[4px] border border-brand-200 bg-white p-3 text-base text-ink" />
          </div>

          <div className="mt-4">
            <AdminImageSlot
              id="category-image"
              label="Category image"
              imageUrl={categoryForm.imageUrl}
              selectedFile={categoryImageFile}
              onSelectFile={setCategoryImageFile}
              onClearFile={() => setCategoryImageFile(null)}
              onRemoveImage={() =>
                setCategoryForm((current) => ({
                  ...current,
                  imageUrl: '',
                  cloudinaryPublicId: null,
                }))
              }
              helpText="Choose a file from your device. The image uploads when you save this category."
              previewClass="h-36 w-48"
            />
          </div>

          {categoriesError && <p role="alert" className="mt-3 text-sm text-red-700">{categoriesError}</p>}
          {categoryMessage && <p role="status" className="mt-3 text-sm font-medium text-brand-700">{categoryMessage}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" disabled={categorySaving} className="h-10 rounded-[4px] bg-brand-900 px-4 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 cursor-pointer">
              {categorySaving ? 'Uploading and saving...' : editingCategoryId ? 'Save category' : 'Create category'}
            </button>
            {editingCategoryId || categoryForm.parentSlug ? (
              <button type="button" onClick={() => beginNewCategory()} className="h-10 rounded-[4px] border-2 border-ink px-4 text-sm font-medium text-ink hover:bg-ink hover:text-white cursor-pointer">
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        {categoriesLoading ? (
          <p className="mt-6 text-sm text-ink/70">Loading categories...</p>
        ) : categoriesError ? (
          <p role="alert" className="mt-6 text-sm text-red-700">{categoriesError}</p>
        ) : topLevelCategories.length === 0 ? (
          <p className="mt-6 text-sm text-ink/70">No categories have been created.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {topLevelCategories.map((category) => {
              const children = categories.filter((item) => item.parentId === category.id)

              return (
                <div key={category.id} className="rounded-lg border border-brand-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {category.imageUrl ? (
                        <img
                          src={cloudinaryUrl(category.imageUrl, 200)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-14 w-14 rounded-[4px] object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-[4px] border border-brand-200 bg-brand-50" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{category.name}</p>
                        <p className="text-xs text-ink/60">/{category.slug}</p>
                        {category.blurb && <p className="mt-1 text-sm text-ink/70">{category.blurb}</p>}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => beginEditCategory(category)} className="text-sm font-medium text-brand-700 hover:underline cursor-pointer">Edit</button>
                      <button type="button" onClick={() => beginNewCategory(category.slug)} className="text-sm font-medium text-brand-700 hover:underline cursor-pointer">Add subcategory</button>
                      <button type="button" onClick={() => handleDeleteCategory(category)} className="text-sm font-medium text-red-700 hover:underline cursor-pointer">Delete</button>
                    </div>
                  </div>

                  {children.length > 0 && (
                    <ul className="mt-4 space-y-3 border-l-2 border-brand-200 pl-4">
                      {children.map((child) => (
                        <li key={child.id} className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            {child.imageUrl ? (
                              <img
                                src={cloudinaryUrl(child.imageUrl, 200)}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="h-10 w-10 rounded-[4px] object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-[4px] border border-brand-200 bg-brand-50" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-ink">{child.name}</p>
                              <p className="text-xs text-ink/60">/{category.slug}/{child.slug}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button type="button" onClick={() => beginEditCategory(child)} className="text-sm font-medium text-brand-700 hover:underline cursor-pointer">Edit</button>
                            <button type="button" onClick={() => handleDeleteCategory(child)} className="text-sm font-medium text-red-700 hover:underline cursor-pointer">Delete</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
