import { useState, useEffect } from 'react'
import { MessageCircle, Phone, Mail } from 'lucide-react'
import Icon from '../components/Icon.jsx'
import { config } from '../config.js'
import { showrooms } from '../data/showrooms.js'
import { buildGeneralUrl, buildMessageUrl } from '../lib/whatsapp.js'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Contact and showrooms | Aurelle Home'
  }, [])

  const phoneHref = `tel:${config.contact.phone.replace(/[^\d+]/g, '')}`

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedMessage = message.trim()

    if (!trimmedName || !trimmedMessage) {
      setError('Please fill in your name and message.')
      return
    }

    setError('')
    window.open(
      buildMessageUrl({ name: trimmedName, message: trimmedMessage }),
      '_blank',
      'noopener,noreferrer'
    )
    setName('')
    setMessage('')
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16">
      {/* Title */}
      <h1 className="mt-8 font-heading text-3xl text-brand-900 md:text-4xl">
        Contact and showrooms
      </h1>
      <p className="mt-2 max-w-xl text-base text-ink/80">
        Visit us, call us, or message us on WhatsApp.
      </p>

      {/* Showrooms */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {showrooms.map((showroom) => (
          <div
            key={showroom.id}
            className="rounded-lg border-2 border-ink bg-brand-50 p-5"
          >
            <h2 className="font-heading text-2xl text-brand-900">
              {showroom.city} showroom
            </h2>
            <p className="mt-1 text-sm text-ink/80">{showroom.area}</p>

            <dl className="mt-4 divide-y divide-brand-200 border-y border-brand-200 text-sm">
              {showroom.hours.map((h, i) => (
                <div key={i} className="flex justify-between gap-4 py-2">
                  <dt className="text-ink/70">{h.days}</dt>
                  <dd className="text-ink font-medium">{h.time}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  showroom.area
                )}`}
                className="inline-flex h-10 items-center rounded-[4px] border-2 border-ink px-4 text-sm font-medium text-ink hover:bg-ink hover:text-white transition-colors"
              >
                Get directions
              </a>
              <a
                href={phoneHref}
                className="inline-flex h-10 items-center rounded-[4px] border-2 border-ink px-4 text-sm font-medium text-ink hover:bg-ink hover:text-white transition-colors"
              >
                Call us
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Ways to reach us */}
      <section className="mt-12">
        <h2 className="font-heading text-2xl text-brand-900 md:text-3xl">
          Reach us
        </h2>
        <ul className="mt-4 divide-y divide-brand-200 border-y border-brand-200">
          <li>
            <a
              href={buildGeneralUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 py-4 text-base text-ink hover:text-brand-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon icon={MessageCircle} size={22} />
                <span>WhatsApp</span>
              </div>
              <span className="text-sm text-ink/70">Chat with us</span>
            </a>
          </li>
          <li>
            <a
              href={phoneHref}
              className="flex items-center justify-between gap-4 py-4 text-base text-ink hover:text-brand-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon icon={Phone} size={22} />
                <span>Phone</span>
              </div>
              <span className="text-sm text-ink/70">{config.contact.phone}</span>
            </a>
          </li>
          <li>
            <a
              href={`mailto:${config.contact.email}`}
              className="flex items-center justify-between gap-4 py-4 text-base text-ink hover:text-brand-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon icon={Mail} size={22} />
                <span>Email</span>
              </div>
              <span className="text-sm text-ink/70">{config.contact.email}</span>
            </a>
          </li>
        </ul>
      </section>

      {/* Message form */}
      <section className="mt-12 max-w-xl">
        <h2 className="font-heading text-2xl text-brand-900 md:text-3xl">
          Send us a message
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="contact-name" className="mt-4 block text-sm text-ink">
              Your name
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              className="mt-1 h-12 w-full rounded-[4px] border border-brand-200 bg-white px-4 text-base"
            />
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="mt-4 block text-sm text-ink"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              rows={4}
              required
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                if (error) setError('')
              }}
              className="mt-1 w-full rounded-[4px] border border-brand-200 bg-white px-4 py-3 text-base"
            />
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-4 inline-flex h-12 items-center justify-center rounded-[4px] bg-brand-900 px-6 text-sm font-medium text-white hover:bg-brand-700 cursor-pointer transition-colors"
          >
            Send on WhatsApp
          </button>

          <p className="mt-3 text-xs text-ink/60">
            This opens WhatsApp so you can send your message.
          </p>
        </form>
      </section>
    </div>
  )
}

