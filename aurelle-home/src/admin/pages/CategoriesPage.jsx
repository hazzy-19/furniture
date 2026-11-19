import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteAdminCategory,
  listAdminCategories,
} from '../../lib/adminApi.js'
import { cloudinaryUrl } from '../../lib/cloudinaryUrl.js'
import usePageMeta from '../../lib/usePageMeta.js'

export default function CategoriesPage() {
  usePageMeta({
    title: 'Categories | Admin | Aurelle Home',
    description: 'Category management table.',
    noindex: true,
  })

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listAdminCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load categories.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Lookup map for parent names
  const categoryMap = useMemo(() => {
    const map = new Map()
    for (const cat of categories) {
      map.set(cat.id, cat.name)
    }
    return map
  }, [categories])

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete category "${category.name}"?`,
    )
    if (!confirmed) return

    setDeleteError('')

    try {
      await deleteAdminCategory(category.id)
      await loadCategories()
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete category.')
    }
  }

  return (
    <div>
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl text-brand-900">Categories</h1>
          <p className="mt-1 text-sm text-ink/70">
            Manage top-level store categories and room subcategories.
          </p>
        </div>
        <Link
          to="/admin/categories/new"
          className="inline-flex h-12 cursor-pointer items-center justify-center rounded-[4px] bg-brand-900 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          New category
        </Link>
      </div>

      {deleteError && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700"
        >
          {deleteError}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-ink/70">Loading categories...</p>
      ) : error ? (
        <p role="alert" className="mt-8 text-sm text-red-700">
          {error}
        </p>
      ) : categories.length === 0 ? (
        <div className="mt-8 rounded-lg border border-brand-200 bg-brand-50 p-8 text-center">
          <p className="font-heading text-lg text-brand-900">No categories found</p>
          <p className="mt-1 text-xs text-ink/60">
            Click &quot;New category&quot; above to create your first storefront category.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border border-brand-200 bg-white">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-ink bg-brand-50/50">
                <th className="py-3 pl-4 pr-3 font-semibold text-ink">Thumbnail</th>
                <th className="py-3 px-3 font-semibold text-ink">Name</th>
                <th className="py-3 px-3 font-semibold text-ink">Slug</th>
                <th className="py-3 px-3 font-semibold text-ink">Parent</th>
                <th className="py-3 px-3 font-semibold text-ink">Sort order</th>
                <th className="py-3 pl-3 pr-4 text-right font-semibold text-ink">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-200">
              {categories.map((category) => {
                const parentName = category.parentId
                  ? categoryMap.get(category.parentId) || category.parentName || 'Unknown'
                  : 'None'

                return (
                  <tr key={category.id} className="hover:bg-brand-50/40">
                    <td className="py-3 pl-4 pr-3">
                      {category.imageUrl ? (
                        <img
                          src={cloudinaryUrl(category.imageUrl, 200)}
                          alt=""
                          className="h-10 w-10 rounded-[4px] border border-brand-200 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-[4px] border border-brand-200 bg-brand-50" />
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-ink">
                      <Link
                        to={`/admin/categories/${category.id}`}
                        className="hover:text-brand-500 hover:underline"
                      >
                        {category.name}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-ink/70">
                      /{category.slug}
                    </td>
                    <td className="py-3 px-3 text-ink/80">{parentName}</td>
                    <td className="py-3 px-3 text-ink/80">{category.sortOrder}</td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/admin/categories/${category.id}`}
                          className="font-medium text-brand-700 hover:text-brand-500 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          className="cursor-pointer font-medium text-red-700 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
