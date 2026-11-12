import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import { OrderListProvider } from './context/OrderListContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import OrderPage from './pages/OrderPage.jsx'
import DesignTokens from './pages/DesignTokens.jsx'
import ComingSoon from './pages/ComingSoon.jsx'

function App() {
  return (
    <FavoritesProvider>
      <OrderListProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/tokens" element={<DesignTokens />} />
              <Route path="/shop/:room" element={<ShopPage />} />
              <Route path="/shop/:room/:category" element={<ShopPage />} />
              <Route path="/new" element={<ShopPage mode="new" />} />
              <Route path="/sale" element={<ShopPage mode="sale" />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/order" element={<OrderPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </OrderListProvider>
    </FavoritesProvider>
  )
}

export default App
