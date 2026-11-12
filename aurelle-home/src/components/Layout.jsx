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
    <div className="flex flex-col bg-page text-ink font-body">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[4px] focus:bg-brand-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <ScrollToTop />
      <PromoStrip />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <EmailSignup />
      <Footer />
      <FavoriteSheet />
      <WhatsAppButton />
    </div>
  )
}

