import { Outlet } from 'react-router-dom'
import PromoStrip from './PromoStrip.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import WhatsAppButton from './WhatsAppButton.jsx'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-page text-ink font-body">
      <PromoStrip />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

