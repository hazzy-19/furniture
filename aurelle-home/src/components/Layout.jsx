import { Outlet } from 'react-router-dom'
import ScrollToTop from './ScrollToTop.jsx'
import PromoStrip from './PromoStrip.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import WhatsAppButton from './WhatsAppButton.jsx'
import EmailSignup from './EmailSignup.jsx'
import FavoriteSheet from './FavoriteSheet.jsx'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-page text-ink font-body">
      <ScrollToTop />
      <PromoStrip />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <EmailSignup />
      <Footer />
      <FavoriteSheet />
      <WhatsAppButton />
    </div>
  )
}

