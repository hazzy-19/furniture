import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import { OrderListProvider } from './context/OrderListContext.jsx'
import { MenuProvider } from './context/MenuContext.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import OrderPage from './pages/OrderPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx'))
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm.jsx'))

function App() {
  return (
    <AdminAuthProvider>
      <FavoritesProvider>
        <OrderListProvider>
          <BrowserRouter>
            <MenuProvider>
              <Suspense fallback={<div className="p-8 text-center text-sm text-ink/70">Loading...</div>}>
                <Routes>
                  {/* Admin routes (outside storefront layout) */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="products" replace />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminProductForm />} />
                    <Route path="products/:id" element={<AdminProductForm />} />
                  </Route>

                  {/* Public storefront routes (inside storefront layout) */}
                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop/:room" element={<ShopPage />} />
                    <Route path="/shop/:room/:category" element={<ShopPage />} />
                    <Route path="/new" element={<ShopPage mode="new" />} />
                    <Route path="/sale" element={<ShopPage mode="sale" />} />
                    <Route path="/product/:slug" element={<ProductPage />} />
                    <Route path="/order" element={<OrderPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/showrooms" element={<ContactPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </MenuProvider>
          </BrowserRouter>
        </OrderListProvider>
      </FavoritesProvider>
    </AdminAuthProvider>
  )
}

export default App
