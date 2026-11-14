import { createContext, useContext, useState, useEffect } from 'react'
import { me as apiMe, login as apiLogin, logout as apiLogout } from '../lib/adminApi.js'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    apiMe()
      .then((data) => {
        if (active) {
          setAdmin(data)
        }
      })
      .catch(() => {
        if (active) {
          setAdmin(null)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const login = async (email, password) => {
    const data = await apiLogin(email, password)
    setAdmin(data)
    return data
  }

  const logout = async () => {
    try {
      await apiLogout()
    } finally {
      setAdmin(null)
    }
  }

  const value = {
    admin,
    loading,
    login,
    logout,
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export default AdminAuthContext

