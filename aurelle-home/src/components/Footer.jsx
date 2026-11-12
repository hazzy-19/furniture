import { Link } from 'react-router-dom'
import { config } from '../config.js'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-brand-900 text-brand-50 mt-auto border-t border-brand-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Footer Navigation Columns: stacks on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pb-12 border-b border-brand-700/70">
          {/* Column 1: Shop */}
          <div>
            <h4 className="font-heading text-lg font-semibold tracking-wide text-brand-50 mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-200">
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Living room
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Dining
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Bedroom
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Decor
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: About */}
          <div>
            <h4 className="font-heading text-lg font-semibold tracking-wide text-brand-50 mb-4">
              About
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-200">
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Showrooms
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold tracking-wide text-brand-50 mb-4">
              Contact
            </h4>
            <div className="space-y-2.5 text-sm text-brand-200">
              <p>
                <span className="block text-xs uppercase tracking-wider text-brand-200/60 mb-0.5">
                  Phone
                </span>
                <a
                  href={`tel:${config.contact.phone.replace(/\s+/g, '')}`}
                  className="hover:text-white transition-colors font-medium"
                >
                  {config.contact.phone}
                </a>
              </p>
              <p>
                <span className="block text-xs uppercase tracking-wider text-brand-200/60 mb-0.5">
                  Email
                </span>
                <a
                  href={`mailto:${config.contact.email}`}
                  className="hover:text-white transition-colors font-medium break-all"
                >
                  {config.contact.email}
                </a>
              </p>
              <p className="text-xs text-brand-200/70 pt-1">
                {config.contact.locations}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Wordmark and Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-200/70 text-center sm:text-left">
          <p className="font-heading text-base tracking-wider text-brand-50">
            Aurelle <span className="text-gold-500">Home</span>
          </p>
          <p>© {currentYear} Aurelle Home. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
