import { useState, useRef, useEffect, useCallback, ReactNode } from 'react'
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

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const dropdownWidth = 192 // w-48 = 192px
      const estimatedItemHeight = 40
      const itemCount = menuItems.length + (onEdit ? 1 : 0) + (onDelete ? 1 : 0)
      const separatorCount =
        (menuItems.length > 0 && (onEdit || onDelete) ? 1 : 0) + (onEdit && onDelete ? 1 : 0)
      const dropdownHeight = itemCount * estimatedItemHeight + separatorCount * 8 + 8 // padding
      const windowHeight = window.innerHeight
      const spaceBelow = windowHeight - buttonRect.bottom
      const spaceAbove = buttonRect.top

      // Calculate horizontal position - prefer right alignment, but adjust if needed
      let left = buttonRect.right + window.scrollX - dropdownWidth
      if (left < window.scrollX + 8) {
        // Not enough space on right, align to left of button
        left = buttonRect.left + window.scrollX
      }

      // Calculate vertical position - prefer opening down, but adjust if needed
      let top = buttonRect.bottom + window.scrollY + 4 // Default: open down
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        // Not enough space below, but enough above - open upward
        top = buttonRect.top + window.scrollY - dropdownHeight - 4
      } else if (spaceBelow < dropdownHeight && spaceAbove < dropdownHeight) {
        // Not enough space either way - open down but adjust to fit
        top = window.scrollY + windowHeight - dropdownHeight - 8
      }

      setPosition({ top, left })
    }
  }, [menuItems.length, onEdit, onDelete])

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
  }, [isOpen, updatePosition])

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
      className="w-48 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-dark-200 dark:border-dark-700 overflow-hidden animate-fade-in-zoom"
    >
      {/* Custom Menu Items */}
      {menuItems.map((item, index) => (
        <div key={index}>
          {index > 0 && <div className="h-px bg-dark-100 dark:bg-dark-700" />}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              setIsOpen(false)
              item.onClick()
            }}
            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-dark-50 dark:hover:bg-dark-700/50 active:bg-dark-100 dark:active:bg-dark-700 transition-colors flex items-center gap-3 ${
              item.className || 'text-dark-900 dark:text-dark-50'
            }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
          </button>
        </div>
      ))}

      {/* Separator between custom items and standard actions */}
      {menuItems.length > 0 && (onEdit || onDelete) && (
        <div className="h-px bg-dark-100 dark:bg-dark-700 my-1 mx-2" />
      )}

      {/* Edit Button */}
      {onEdit && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            setIsOpen(false)
            onEdit()
          }}
          className="w-full px-4 py-2.5 text-left text-sm text-dark-900 dark:text-dark-50 hover:bg-dark-50 dark:hover:bg-dark-700/50 active:bg-dark-100 dark:active:bg-dark-700 transition-colors flex items-center gap-3"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span className="flex-1">Editar</span>
        </button>
      )}

      {/* Separator before delete */}
      {onEdit && onDelete && <div className="h-px bg-dark-100 dark:bg-dark-700 my-1" />}

      {/* Delete Button */}
      {onDelete && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            setIsOpen(false)
            onDelete()
          }}
          className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 transition-colors flex items-center gap-3"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span className="flex-1">Excluir</span>
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
        className={`flex-shrink-0 p-1.5 text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 transition-all duration-150 rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 active:scale-95 ${
          isOpen ? 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300' : ''
        }`}
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {isOpen && createPortal(dropdownMenu, document.body)}
    </>
  )
}
