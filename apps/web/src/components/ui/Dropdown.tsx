import { useState, useRef, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DropdownItem {
  label: string
  onClick: () => void
  icon?: ReactNode
  variant?: 'default' | 'danger'
}

interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  function handleItemClick(item: DropdownItem) {
    item.onClick()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={cn(
              'absolute z-50 mt-2 w-56 rounded-lg bg-white border border-dark-200 shadow-xl',
              'dark:bg-dark-900 dark:border-dark-800',
              'animate-fade-in-down',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <div className="py-1">
              {items.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200',
                    'hover:bg-dark-100 dark:hover:bg-dark-800',
                    'active:scale-95',
                    item.variant === 'danger'
                      ? 'text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300'
                      : 'text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-dark-50'
                  )}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
