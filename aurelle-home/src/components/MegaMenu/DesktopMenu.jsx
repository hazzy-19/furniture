import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Image as ImageIcon } from 'lucide-react'
import Icon from '../Icon.jsx'
import { rooms, plainLinks } from '../../data/menu.js'

export default function DesktopMenu() {
  const [activeRoomId, setActiveRoomId] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)

  const navContainerRef = useRef(null)
  const triggerRefs = useRef({})
  const firstLinkRef = useRef(null)
  const openTimerRef = useRef(null)
  const closeTimerRef = useRef(null)
  const categoryLeaveTimerRef = useRef(null)
  const location = useLocation()

  const activeRoom = rooms.find((room) => room.id === activeRoomId)
  const activeItem = activeCategory || activeRoom

  // Clear all pending open and close timers
  const clearTimers = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    if (categoryLeaveTimerRef.current) {
      clearTimeout(categoryLeaveTimerRef.current)
      categoryLeaveTimerRef.current = null
    }
  }

  // Close panel on route change
  useEffect(() => {
    clearTimers()
    setActiveRoomId(null)
    setActiveCategory(null)
  }, [location.pathname])

  // Reset activeCategory when the active room changes
  useEffect(() => {
    setActiveCategory(null)
  }, [activeRoomId])

  // Preload images of categories that have image URLs when a room's panel opens
  useEffect(() => {
    if (!activeRoom) return
    activeRoom.categories.forEach((cat) => {
      if (cat.image) {
        const img = new window.Image()
        img.src = cat.image
      }
    })
    if (activeRoom.image) {
      const img = new window.Image()
      img.src = activeRoom.image
    }
  }, [activeRoomId, activeRoom])

  // Close panel on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target)) {
        clearTimers()
        setActiveRoomId(null)
        setActiveCategory(null)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      clearTimers()
    }
  }, [])

  // Open with ~150ms delay on hover/focus
  const handleTriggerMouseEnter = (roomId) => {
    clearTimers()
    if (activeRoomId) {
      setActiveRoomId(roomId)
    } else {
      openTimerRef.current = setTimeout(() => {
        setActiveRoomId(roomId)
      }, 150)
    }
  }

  // Close with ~150ms delay on mouse leave
  const handleTriggerMouseLeave = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    closeTimerRef.current = setTimeout(() => {
      setActiveRoomId(null)
      setActiveCategory(null)
    }, 150)
  }

  // Prevent closing when mouse enters panel
  const handlePanelMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  // Start close timer when mouse leaves panel
  const handlePanelMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveRoomId(null)
      setActiveCategory(null)
    }, 150)
  }

  // Category hover & focus management with ~100ms leave debounce
  const clearCategoryLeaveTimer = () => {
    if (categoryLeaveTimerRef.current) {
      clearTimeout(categoryLeaveTimerRef.current)
      categoryLeaveTimerRef.current = null
    }
  }

  const handleCategoryMouseEnter = (category) => {
    clearCategoryLeaveTimer()
    setActiveCategory(category)
  }

  const handleCategoryFocus = (category) => {
    clearCategoryLeaveTimer()
    setActiveCategory(category)
  }

  const handleLinkListMouseLeave = () => {
    clearCategoryLeaveTimer()
    categoryLeaveTimerRef.current = setTimeout(() => {
      setActiveCategory(null)
    }, 100)
  }

  const handleLinkListBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      clearCategoryLeaveTimer()
      categoryLeaveTimerRef.current = setTimeout(() => {
        setActiveCategory(null)
      }, 100)
    }
  }

  // Keyboard navigation on trigger button
  const handleTriggerKeyDown = (e, roomId) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      clearTimers()
      setActiveRoomId(roomId)
      setTimeout(() => {
        if (firstLinkRef.current) {
          firstLinkRef.current.focus()
        }
      }, 50)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      clearTimers()
      setActiveRoomId(null)
      setActiveCategory(null)
    }
  }

  // Keyboard navigation inside panel
  const handlePanelKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      clearTimers()
      const currentTrigger = triggerRefs.current[activeRoomId]
      setActiveRoomId(null)
      setActiveCategory(null)
      if (currentTrigger) {
        currentTrigger.focus()
      }
    }
  }

  return (
    <div ref={navContainerRef} className="relative">
      {/* Desktop Main Navigation Bar */}
      <nav aria-label="Main category navigation" className="max-w-7xl mx-auto px-6 h-11 flex items-center justify-center gap-8 text-sm font-medium">
        {/* Rooms with dropdown panel */}
        {rooms.map((room) => {
          const isOpen = activeRoomId === room.id
          return (
            <button
              key={room.id}
              ref={(el) => (triggerRefs.current[room.id] = el)}
              type="button"
              aria-expanded={isOpen}
              aria-controls="desktop-megamenu-panel"
              aria-haspopup="true"
              onClick={() => {
                clearTimers()
                setActiveRoomId(isOpen ? null : room.id)
              }}
              onMouseEnter={() => handleTriggerMouseEnter(room.id)}
              onMouseLeave={handleTriggerMouseLeave}
              onFocus={() => handleTriggerMouseEnter(room.id)}
              onBlur={handleTriggerMouseLeave}
              onKeyDown={(e) => handleTriggerKeyDown(e, room.id)}
              className={`inline-flex items-center gap-1.5 py-2 px-1 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:underline ${
                isOpen ? 'text-brand-500 font-semibold' : 'text-ink hover:text-brand-500'
              }`}
            >
              <span>{room.label}</span>
              <Icon
                icon={ChevronDown}
                size={14}
                className={`transition-transform duration-200 motion-reduce:transition-none ${
                  isOpen ? 'rotate-180 text-brand-500' : 'text-ink/60'
                }`}
              />
            </button>
          )
        })}

        {/* Plain Links */}
        {plainLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onMouseEnter={() => {
              clearTimers()
              setActiveRoomId(null)
              setActiveCategory(null)
            }}
            onFocus={() => {
              clearTimers()
              setActiveRoomId(null)
              setActiveCategory(null)
            }}
            className={`py-2 px-1 text-sm font-medium transition-colors hover:text-brand-500 focus:outline-none focus-visible:underline ${
              link.isHighlighted ? 'text-brand-500 font-semibold' : 'text-ink'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* ONE Shared Full-Width Panel (renders only the active room) */}
      {activeRoom && (
        <div
          id="desktop-megamenu-panel"
          role="region"
          aria-label={`${activeRoom.label} menu`}
          onMouseEnter={handlePanelMouseEnter}
          onMouseLeave={handlePanelMouseLeave}
          onKeyDown={handlePanelKeyDown}
          className="absolute left-0 right-0 top-full z-40 bg-page border-b-2 border-ink max-h-[70vh] overflow-y-auto"
        >
          {/* Inner Structure: exact 48px (gap-12) gap, max-w-4xl, py-5 */}
          <div className="mx-auto flex max-w-4xl items-start justify-center gap-12 px-6 py-5">
            {/* Category list (left, 380px wide) */}
            <div className="w-[380px] shrink-0">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-700">
                Categories in {activeRoom.label}
              </p>
              <div
                className="grid grid-cols-2 gap-x-10 gap-y-0.5"
                onMouseLeave={handleLinkListMouseLeave}
                onMouseEnter={clearCategoryLeaveTimer}
                onBlur={handleLinkListBlur}
              >
                {activeRoom.categories.map((category, idx) => (
                  <Link
                    key={category.path}
                    ref={idx === 0 ? firstLinkRef : null}
                    to={category.path}
                    onMouseEnter={() => handleCategoryMouseEnter(category)}
                    onFocus={() => handleCategoryFocus(category)}
                    onClick={() => {
                      clearTimers()
                      setActiveRoomId(null)
                      setActiveCategory(null)
                    }}
                    className="block py-1.5 text-base text-ink hover:text-brand-500"
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured card (right, 260px wide by 170px high, exact) */}
            <div
              className="h-[170px] w-[260px] shrink-0 overflow-hidden rounded-lg border border-brand-200 bg-brand-200"
              aria-hidden="true"
            >
              {activeItem &&
                (activeItem.image ? (
                  <img
                    key={activeItem.id}
                    src={activeItem.image}
                    alt=""
                    className="h-full w-full animate-menu-fade object-cover"
                  />
                ) : (
                  <div
                    key={activeItem.id}
                    className="flex h-full w-full animate-menu-fade flex-col items-center justify-center gap-2 bg-brand-200 text-brand-700"
                  >
                    <Icon icon={ImageIcon} size={32} className="text-brand-700" />
                    <span className="text-sm">{activeItem.label}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
