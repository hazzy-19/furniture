import { MessageCircle } from 'lucide-react'
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
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 bg-whatsapp hover:brightness-95 flex items-center justify-center rounded-[4px] border border-whatsapp transition-transform hover:scale-105 cursor-pointer text-white"
      >
        <Icon icon={MessageCircle} size={28} className="text-white" />
      </a>
    </aside>
  )
}

