import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Image as ImageIcon } from 'lucide-react'
import Icon from '../Icon.jsx'
import { rooms, plainLinks } from '../../data/menu.js'

export default function DesktopMenu() {
  // activeRoom holds { id, left } when a room menu is open, or null
  const [activeRoom, setActiveRoom] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)

  const navContainerRef = useRef(null)
  const triggerRefs = useRef({})
  const firstLinkRef = useRef(null)
  const openTimerRef = useRef(null)
  const closeTimerRef = useRef(null)
  const categoryLeaveTimerRef = useRef(null)
  const location = useLocation()

  const currentRoom = activeRoom
    ? rooms.find((room) => room.id === activeRoom.id) || null
    : null
  const activeItem = activeCategory || currentRoom

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

  // Compute anchored left offset relative to navContainerRef
  const computeLeft = (roomId) => {
    const triggerEl = triggerRefs.current[roomId]
    const containerEl = navContainerRef.current
    if (!triggerEl || !containerEl) return 0

    const triggerRect = triggerEl.getBoundingClientRect()
    const containerRect = containerEl.getBoundingClientRect()

    const desired = triggerRect.left
    const maxLeft = window.innerWidth - 500 - 16
    const clamped = Math.max(16, Math.min(desired, maxLeft))
    return clamped - containerRect.left
  }

  // Open a room: compute left in the same handler that sets the active room
  const openRoom = (roomId) => {
    const left = computeLeft(roomId)
    setActiveRoom({ id: roomId, left })
  }

  // Close the room
  const closeRoom = () => {
    setActiveRoom(null)
    setActiveCategory(null)
  }

  // Close panel on route change
  useEffect(() => {
    clearTimers()
    closeRoom()
  }, [location.pathname])

  // Reset activeCategory when the active room changes
  useEffect(() => {
    setActiveCategory(null)
  }, [activeRoom?.id])

  // Preload images of categories that have image URLs when a room's panel opens
  useEffect(() => {
    if (!currentRoom) return
    currentRoom.categories.forEach((cat) => {
      if (cat.image) {
        const img = new window.Image()
        img.src = cat.image
      }
    })
    if (currentRoom.image) {
      const img = new window.Image()
      img.src = currentRoom.image
    }
  }, [currentRoom])

  // Recompute left for the active room on window resize (active only while open)
  useEffect(() => {
    if (!activeRoom) return

    const handleResize = () => {
      const left = computeLeft(activeRoom.id)
      setActiveRoom((prev) => (prev ? { ...prev, left } : null))
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [activeRoom?.id])

  // Close panel on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target)) {
        clearTimers()
        closeRoom()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      clearTimers()
    }
  }, [])

  // Open with ~150ms delay on hover/focus (instant switch if already open)
  const handleTriggerMouseEnter = (roomId) => {
    clearTimers()
    if (activeRoom) {
      openRoom(roomId)
    } else {
      openTimerRef.current = setTimeout(() => {
        openRoom(roomId)
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
      closeRoom()
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
      closeRoom()
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
      openRoom(roomId)
      setTimeout(() => {
        if (firstLinkRef.current) {
          firstLinkRef.current.focus()
        }
      }, 50)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      clearTimers()
      closeRoom()
    }
  }

  // Keyboard navigation inside panel
  const handlePanelKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      clearTimers()
      const currentTrigger = triggerRefs.current[activeRoom?.id]
      closeRoom()
      if (currentTrigger) {
        currentTrigger.focus()
      }
    }
  }

  return (
    <div ref={navContainerRef} className="relative">
      {/* Desktop Main Navigation Bar */}
      <nav
        aria-label="Main category navigation"
        className="max-w-7xl mx-auto px-6 h-11 flex items-center justify-center gap-8 text-sm font-medium"
      >
        {/* Rooms with anchored dropdown card */}
        {rooms.map((room) => {
          const isOpen = activeRoom?.id === room.id
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
                if (isOpen) {
                  closeRoom()
                } else {
                  openRoom(room.id)
                }
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
              closeRoom()
            }}
            onFocus={() => {
              clearTimers()
              closeRoom()
            }}
            className={`py-2 px-1 text-sm font-medium transition-colors hover:text-brand-500 focus:outline-none focus-visible:underline ${
              link.isHighlighted ? 'text-brand-500 font-semibold' : 'text-ink'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* ONE Shared Anchored Card (rendered only when activeRoom exists) */}
      {currentRoom && activeRoom && (
        <div
          style={{ left: activeRoom.left }}
          className="absolute top-full z-40 mt-1 w-[500px] rounded-lg border-2 border-ink bg-page transition-[left,opacity] duration-150 motion-reduce:transition-none"
          id="desktop-megamenu-panel"
          role="region"
          aria-label={`${currentRoom.label} menu`}
          onMouseEnter={handlePanelMouseEnter}
          onMouseLeave={handlePanelMouseLeave}
          onKeyDown={handlePanelKeyDown}
        >
          <div className="flex min-h-[240px] gap-4 p-4">
            {/* Categories block: single column <ul> */}
            <div className="w-[200px] shrink-0">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-700">
                Categories in {currentRoom.label}
              </p>
              <ul
                onMouseLeave={handleLinkListMouseLeave}
                onMouseEnter={clearCategoryLeaveTimer}
                onBlur={handleLinkListBlur}
              >
                {currentRoom.categories.map((category, idx) => (
                  <li key={category.path}>
                    <Link
                      ref={idx === 0 ? firstLinkRef : null}
                      to={category.path}
                      onMouseEnter={() => handleCategoryMouseEnter(category)}
                      onFocus={() => handleCategoryFocus(category)}
                      onClick={() => {
                        clearTimers()
                        closeRoom()
                      }}
                      className="block py-1.5 text-base text-ink hover:text-brand-500"
                    >
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preview block: 248px wide by 200px high */}
            <div
              className="h-[200px] w-[248px] shrink-0 overflow-hidden rounded-[4px] border border-brand-200 bg-brand-200"
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
