import Icon from './Icon.jsx'
import { config } from '../config.js'

export default function WhatsAppButton() {
  // Strip non-digits to ensure clean wa.me phone link
  const cleanPhone = config.whatsapp.phoneNumber.replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    config.whatsapp.generalInquiry
  )}`

  return (
    <aside aria-label="WhatsApp Assistance">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
      >
        <Icon icon="whatsapp" size={28} className="text-white" />
      </a>
    </aside>
  )
}

