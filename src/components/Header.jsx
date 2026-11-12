import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Search, Heart, User, ShoppingBag } from 'lucide-react'
import Icon from './Icon.jsx'
import DesktopMenu from './MegaMenu/DesktopMenu.jsx'
import MobileDrawer from './MegaMenu/MobileDrawer.jsx'

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <header className="bg-page border-b-2 border-ink sticky top-0 z-40">
        {/* Main Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button - opens mobile drawer */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden p-2 rounded-[4px] text-ink hover:bg-brand-50 transition-colors cursor-pointer"
            >
              <Icon icon={Menu} size={22} />
            </button>

            {/* Desktop Search Field */}
            <div className="hidden md:flex items-center relative w-60 lg:w-72">
              <div className="absolute left-3 pointer-events-none text-brand-700">
                <Icon icon={Search} size={16} />
              </div>
              <input
                type="search"
                placeholder="Search furniture, decor"
                aria-label="Search furniture and decor"
                className="w-full bg-white border border-brand-200 text-ink text-xs pl-9 pr-3 py-2 rounded-[4px] focus:outline-none focus:border-brand-500 font-body placeholder:text-ink/50"
              />
            </div>
          </div>

          {/* Center: Wordmark */}
          <div className="text-center">
            <Link
              to="/"
              className="font-heading text-xl sm:text-2xl md:text-3xl font-semibold tracking-wider text-ink hover:opacity-95 transition-opacity inline-block"
            >
              Aurelle <span className="text-gold-500">Home</span>
            </Link>
          </div>

          {/* Right Section: Action Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1.5">
            {/* Mobile Search Button */}
            <button
              type="button"
              aria-label="Search"
              className="md:hidden p-1.5 sm:p-2 rounded-[4px] text-ink hover:bg-brand-50 transition-colors cursor-pointer"
            >
              <Icon icon={Search} size={20} />
            </button>

            {/* Favorites Button */}
            <button
              type="button"
              aria-label="Favorites"
              className="p-1.5 sm:p-2 rounded-[4px] text-ink hover:bg-brand-50 transition-colors cursor-pointer"
            >
              <Icon icon={Heart} size={20} />
            </button>

            {/* User Account Button */}
            <button
              type="button"
              aria-label="Account"
              className="p-1.5 sm:p-2 rounded-[4px] text-ink hover:bg-brand-50 transition-colors cursor-pointer"
            >
              <Icon icon={User} size={20} />
            </button>

            {/* Shopping Bag Button */}
            <button
              type="button"
              aria-label="Shopping bag"
              className="p-1.5 sm:p-2 rounded-[4px] text-ink hover:bg-brand-50 transition-colors cursor-pointer"
            >
              <Icon icon={ShoppingBag} size={20} />
            </button>
          </div>
        </div>

        {/* Desktop Mega-Menu Nav Row */}
        <div className="hidden md:block border-t border-brand-200 bg-page">
          <DesktopMenu />
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  )
}
