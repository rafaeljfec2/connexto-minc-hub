import { useState, useRef, useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface MenuItem {
  label: string
  onClick: () => void
  icon?: ReactNode
  className?: string
}

interface ItemMenuDropdownProps {
  readonly onEdit?: () => void
  readonly onDelete?: () => void
  readonly menuItems?: MenuItem[]
}

export function ItemMenuDropdown({ onEdit, onDelete, menuItems = [] }: ItemMenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen])

  function updatePosition() {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const dropdownWidth = 160 // w-40 = 160px
      const dropdownHeight = 88 // Estimated height
      const windowHeight = window.innerHeight
      const spaceBelow = windowHeight - buttonRect.bottom

      let top = buttonRect.bottom + window.scrollY + 4 // Default: open down
      const left = buttonRect.right + window.scrollX - dropdownWidth // Align right

      // Check if should open upward
      if (spaceBelow < dropdownHeight && buttonRect.top > dropdownHeight) {
        top = buttonRect.top + window.scrollY - dropdownHeight - 4
      }

      setPosition({ top, left })
    }
  }

  function toggleMenu(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isOpen) {
      updatePosition()
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  const dropdownMenu = (
    <div
      ref={menuRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        position: 'absolute',
        zIndex: 9999,
      }}
      className="w-40 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-dark-200 dark:border-dark-700 overflow-hidden"
    >
      {/* Custom Menu Items */}
      {menuItems.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={e => {
            e.stopPropagation()
            setIsOpen(false)
            item.onClick()
          }}
          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors flex items-center gap-2 ${
            item.className || 'text-dark-900 dark:text-dark-50'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}

      {/* Edit Button */}
      {onEdit && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            setIsOpen(false)
            onEdit()
          }}
          className={`w-full px-4 py-2.5 text-left text-sm text-dark-900 dark:text-dark-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors flex items-center gap-2 ${
            menuItems.length > 0 ? 'border-t border-dark-100 dark:border-dark-700' : ''
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Editar
        </button>
      )}

      {/* Delete Button */}
      {onDelete && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            setIsOpen(false)
            onDelete()
          }}
          className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 border-t border-dark-100 dark:border-dark-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Excluir
        </button>
      )}
    </div>
  )

  if (!onEdit && !onDelete && menuItems.length === 0) return null

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="flex-shrink-0 p-1.5 text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 transition-colors rounded-full hover:bg-dark-100 dark:hover:bg-dark-800"
        aria-label="Menu"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {isOpen && createPortal(dropdownMenu, document.body)}
    </>
  )
}
