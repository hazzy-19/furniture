import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { listProducts, updateProduct } from '../../lib/adminApi.js'
import { formatKes } from '../../lib/format.js'
import usePageMeta from '../../lib/usePageMeta.js'

export default function AdminProducts() {
  usePageMeta({
    title: 'Products | Admin | Aurelle Home',
    description: 'Admin product management.',
    noindex: true,
  })

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')

  // Map of product id -> edited stock string
  const [stockInputs, setStockInputs] = useState({})
  // Map of product id -> { saving: bool, saved: bool, error: string }
  const [stockStatus, setStockStatus] = useState({})

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listProducts({
        status: status || undefined,
        search: debouncedSearch || undefined,
      })
      setProducts(data || [])
      setStockInputs({})
    } catch (err) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [status, debouncedSearch])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleStockChange = (productId, value) => {
    setStockInputs((prev) => ({
      ...prev,
      [productId]: value,
    }))
  }

  const handleSaveStock = async (product) => {
    const rawVal = stockInputs[product.id]
    const num = Number(rawVal)
    if (isNaN(num) || num < 0) return

    setStockStatus((prev) => ({
      ...prev,
      [product.id]: { saving: true, saved: false, error: '' },
    }))

    try {
      await updateProduct(product.id, { stock: num })
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: num } : p))
      )
      setStockInputs((prev) => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
      setStockStatus((prev) => ({
        ...prev,
        [product.id]: { saving: false, saved: true, error: '' },
      }))

      setTimeout(() => {
        setStockStatus((prev) => ({
          ...prev,
          [product.id]: { saving: false, saved: false, error: '' },
        }))
      }, 2000)
    } catch (err) {
      setStockStatus((prev) => ({
        ...prev,
        [product.id]: { saving: false, saved: false, error: err.message || 'Failed to save' },
      }))
    }
  }

  return (
    <div>
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-3xl text-brand-900">Products</h1>
        <Link
          to="/admin/products/new"
          className="inline-flex h-12 items-center rounded-[4px] bg-brand-900 px-6 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          New product
        </Link>
      </div>

      {/* Filters Row */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          aria-label="Search products"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-[4px] border border-brand-200 bg-white px-3 text-sm sm:max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-[4px] border border-brand-200 bg-white px-3 text-sm cursor-pointer"
        >
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Content Area */}
      {loading ? (
        <p className="mt-6 text-sm text-ink/70">Loading...</p>
      ) : error ? (
        <p role="alert" className="mt-6 text-sm text-red-700">
          {error}
        </p>
      ) : products.length === 0 ? (
        <p className="mt-6 text-sm text-ink/70">No products found</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b-2 border-ink py-2 text-left font-medium">Name</th>
                <th className="border-b-2 border-ink py-2 text-left font-medium">Status</th>
                <th className="border-b-2 border-ink py-2 text-left font-medium">Price</th>
                <th className="border-b-2 border-ink py-2 text-left font-medium">Stock</th>
                <th className="border-b-2 border-ink py-2 text-left font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const currentStockVal =
                  stockInputs[product.id] !== undefined
                    ? stockInputs[product.id]
                    : String(product.stock ?? 0)
                const isStockChanged =
                  currentStockVal !== String(product.stock ?? 0)
                const state = stockStatus[product.id] || {}

                let badgeClass = 'bg-ink/10 text-ink'
                if (product.status === 'published') {
                  badgeClass = 'bg-brand-200 text-brand-900'
                } else if (product.status === 'draft') {
                  badgeClass = 'bg-gold-500 text-brand-900'
                }

                return (
                  <tr key={product.id} className="border-b border-brand-200">
                    <td className="py-3 pr-4">
                      <Link
                        to={`/admin/products/${product.id}`}
                        className="font-medium text-ink hover:text-brand-500 transition-colors"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-[4px] px-2 py-1 text-xs font-medium ${badgeClass}`}>
                        {product.status || 'draft'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {formatKes(product.priceKes ?? product.price_kes ?? 0)}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={currentStockVal}
                          onChange={(e) => handleStockChange(product.id, e.target.value)}
                          className="h-10 w-20 rounded-[4px] border border-brand-200 px-2"
                        />
                        {isStockChanged && (
                          <button
                            type="button"
                            disabled={state.saving}
                            onClick={() => handleSaveStock(product)}
                            className="h-10 rounded-[4px] bg-brand-900 px-3 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-60 cursor-pointer transition-colors"
                          >
                            {state.saving ? 'Saving...' : 'Save'}
                          </button>
                        )}
                        {state.saved && (
                          <span className="text-xs font-medium text-brand-700">Saved</span>
                        )}
                        {state.error && (
                          <span role="alert" className="text-xs text-red-700">
                            {state.error}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/products/${product.id}`}
                        className="font-medium text-brand-700 hover:text-brand-500 transition-colors"
                      >
                        Edit
                      </Link>
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

