import { Link } from 'react-router-dom'
import { Image as ImageIcon } from 'lucide-react'
import Icon from './Icon.jsx'
import { useMenu } from '../context/MenuContext.jsx'

export default function CategoryTiles() {
  const { rooms } = useMenu()

  return (
    <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
      <h2 className="mb-6 font-heading text-2xl text-brand-900 md:text-3xl">
        Shop by category
      </h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {rooms.map((room) => {
          const destination = room.path || `/shop/${room.id}`

          return (
            <Link
              key={room.id}
              to={destination}
              className="group relative block h-40 overflow-hidden rounded-lg border border-brand-200 bg-brand-200 transition-colors hover:border-brand-500 md:h-56"
            >
              {room.image ? (
                <img
                  src={room.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Icon
                  icon={ImageIcon}
                  size={40}
                  className="absolute inset-0 m-auto text-brand-700"
                />
              )}

              <span className="absolute inset-x-0 bottom-0 bg-brand-900/80 px-3 py-2 text-sm font-medium text-white transition-colors group-hover:bg-brand-500 md:text-base">
                {room.label}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}