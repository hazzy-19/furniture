import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import { OrderListProvider } from './context/OrderListContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import OrderPage from './pages/OrderPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { MenuProvider } from './context/MenuContext.jsx'

function App() {
  return (
    <FavoritesProvider>
      <OrderListProvider>
        <BrowserRouter>
          <MenuProvider>
            <Routes>
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
          </MenuProvider>
        </BrowserRouter>
      </OrderListProvider>
    </FavoritesProvider>
  )
}

export default App
