import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import usePageMeta from '../../lib/usePageMeta.js'

export default function AdminLogin() {
  usePageMeta({
    title: 'Admin | Aurelle Home',
    description: 'Admin login.',
    noindex: true,
  })

  const { admin, login } = useAdminAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (admin) {
    return <Navigate to="/admin/products" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email, password)
      navigate('/admin/products')
    } catch (err) {
      if (err.status === 429) {
        setError('Too many attempts. Try again later.')
      } else {
        setError(err.message || 'Invalid email or password')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-page px-6">
      <div className="w-full max-w-sm rounded-lg border-2 border-ink bg-brand-50 p-6">
        <h1 className="font-heading text-2xl text-brand-900">Admin login</h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email" className="mt-4 block text-sm text-ink">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base"
          />

          <label htmlFor="admin-password" className="mt-4 block text-sm text-ink">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base"
          />

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 h-12 w-full rounded-[4px] bg-brand-900 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  )
}

