import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { ChevronRight, ChevronLeft, X } from 'lucide-react'
import Icon from '../Icon.jsx'
import { rooms, plainLinks } from '../../data/menu.js'

export default function MobileDrawer({ isOpen, onOpenChange }) {
  // Level 1: null (all rooms). Level 2: room object
  const [selectedRoom, setSelectedRoom] = useState(null)

  const handleOpenChange = (open) => {
    onOpenChange(open)
    if (!open) {
      // Reset back to level 1 when drawer closes
      setSelectedRoom(null)
    }
  }

  const handleLinkClick = () => {
    handleOpenChange(false)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        {/* Backdrop Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-ink/40 z-50 transition-opacity duration-200 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 motion-reduce:transition-none" />

        {/* Drawer Content */}
        <Dialog.Content
          aria-describedby="mobile-drawer-description"
          className="fixed top-0 bottom-0 left-0 w-full max-w-[320px] sm:max-w-xs h-full bg-page text-ink z-50 border-r-2 border-ink flex flex-col focus:outline-none transition-transform duration-250 ease-out data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full motion-reduce:transition-none motion-reduce:transform-none"
        >
          <Dialog.Title className="sr-only">Navigation Menu</Dialog.Title>
          <p id="mobile-drawer-description" className="sr-only">
            Browse rooms, furniture categories, and collections
          </p>

          {/* Level 1 View: List of rooms + plain links */}
          {!selectedRoom ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="h-16 px-4 border-b border-brand-200 flex items-center justify-between shrink-0">
                <Link
                  to="/"
                  onClick={handleLinkClick}
                  className="font-heading text-xl font-semibold tracking-wider text-ink"
                >
                  Aurelle <span className="text-gold-500">Home</span>
                </Link>
                <Dialog.Close
                  aria-label="Close menu"
                  className="p-2 rounded-[4px] text-ink hover:bg-brand-50 transition-colors cursor-pointer"
                >
                  <Icon icon={X} size={22} />
                </Dialog.Close>
              </div>

              {/* Navigation List */}
              <div className="flex-1 overflow-y-auto">
                <div className="py-2">
                  <p className="px-4 py-2 text-xs font-semibold text-brand-700 uppercase tracking-wider">
                    Rooms
                  </p>
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      className="w-full flex items-center justify-between py-3 px-4 text-base font-medium text-ink hover:bg-brand-50 border-b border-brand-50 text-left transition-colors cursor-pointer"
                    >
                      <span>{room.label}</span>
                      <Icon icon={ChevronRight} size={18} className="text-brand-700" />
                    </button>
                  ))}
                </div>

                {/* Plain Links at bottom of level 1 */}
                <div className="pt-4 border-t border-brand-200">
                  {plainLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={handleLinkClick}
                      className={`block py-3 px-4 text-base font-medium border-b border-brand-50 transition-colors ${
                        link.isHighlighted
                          ? 'text-brand-500 font-semibold'
                          : 'text-ink hover:text-brand-500'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Level 2 View: Selected Room Categories + Featured Item */
            <div className="flex flex-col h-full">
              {/* Header with Back Button and Room Heading */}
              <div className="h-16 px-3 border-b border-brand-200 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedRoom(null)}
                    aria-label="Back to all rooms"
                    className="p-1.5 rounded-[4px] text-ink hover:bg-brand-50 transition-colors cursor-pointer shrink-0"
                  >
                    <Icon icon={ChevronLeft} size={22} />
                  </button>
                  <h3 className="font-heading text-lg font-semibold text-brand-900 truncate">
                    {selectedRoom.label}
                  </h3>
                </div>
                <Dialog.Close
                  aria-label="Close menu"
                  className="p-2 rounded-[4px] text-ink hover:bg-brand-50 transition-colors cursor-pointer shrink-0"
                >
                  <Icon icon={X} size={22} />
                </Dialog.Close>
              </div>

              {/* Categories list */}
              <div className="flex-1 overflow-y-auto py-2">
                <p className="px-4 py-1.5 text-xs font-semibold text-brand-700 uppercase tracking-wider">
                  Categories
                </p>
                {selectedRoom.categories.map((cat) => (
                  <Link
                    key={cat.path}
                    to={cat.path}
                    onClick={handleLinkClick}
                    className="block py-3 px-4 text-sm font-medium text-ink hover:bg-brand-50 hover:text-brand-500 border-b border-brand-50 transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}

                {/* Featured Block inside level 2 */}
                <div className="p-4 mt-3">
                  <Link
                    to={selectedRoom.featured.path}
                    onClick={handleLinkClick}
                    className="block bg-brand-50 border border-brand-200 rounded-[8px] p-4 hover:border-brand-500 transition-colors"
                  >
                    <span className="text-xs uppercase tracking-wider text-brand-500 font-semibold block mb-0.5">
                      Featured
                    </span>
                    <span className="font-heading text-base font-semibold text-brand-900 block mb-1">
                      {selectedRoom.featured.label}
                    </span>
                    <span className="text-xs text-ink/75 block">
                      {selectedRoom.featured.caption}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

