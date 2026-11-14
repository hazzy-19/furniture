import { Link, Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import usePageMeta from '../../lib/usePageMeta.js'

export default function AdminLayout() {
  usePageMeta({
    title: 'Admin | Aurelle Home',
    description: 'Admin dashboard.',
    noindex: true,
  })

  const { admin, loading, logout } = useAdminAuth()
  const navigate = useNavigate()

  if (loading) {
    return <div className="p-8 text-center text-sm text-ink/70">Loading...</div>
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-page text-ink font-body">
      <header className="border-b-2 border-ink bg-page">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link
            to="/admin/products"
            className="font-heading text-xl text-brand-900 hover:text-brand-700 transition-colors"
          >
            Aurelle Home admin
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink/70">{admin.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="h-10 rounded-[4px] border-2 border-ink px-4 text-sm font-medium text-ink hover:bg-ink hover:text-white cursor-pointer transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8 flex-1 w-full">
        <Outlet />
      </main>
    </div>
  )
}

