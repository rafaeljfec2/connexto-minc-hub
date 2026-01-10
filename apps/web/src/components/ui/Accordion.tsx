import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

interface AccordionContextType {
  openItem: string | null
  toggleItem: (value: string) => void
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined)

interface AccordionProps {
  children: React.ReactNode
  className?: string
  defaultValue?: string
}

export function Accordion({ children, className, defaultValue }: AccordionProps) {
  const [openItem, setOpenItem] = useState<string | null>(defaultValue ?? null)

  const toggleItem = (value: string) => {
    setOpenItem(prev => (prev === value ? null : value))
  }

  const contextValue = React.useMemo(() => ({ openItem, toggleItem }), [openItem])

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn('space-y-4', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  children: React.ReactNode
  value: string
  className?: string
}

export function AccordionItem({ children, value, className }: AccordionItemProps) {
  return (
    <div
      className={cn(
        'border border-dark-200 dark:border-dark-800 rounded-xl overflow-hidden bg-white dark:bg-dark-900 shadow-sm transition-all duration-200',
        className
      )}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // Cloning element to inject value prop
          return React.cloneElement(child, { value })
        }
        return child
      })}
    </div>
  )
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  value?: string // injected by AccordionItem
}

export function AccordionTrigger({ children, className, value }: AccordionTriggerProps) {
  const context = useContext(AccordionContext)
  if (!context) throw new Error('AccordionTrigger must be used within Accordion')

  const isOpen = context.openItem === value

  return (
    <button
      onClick={() => value && context.toggleItem(value)}
      className={cn(
        'w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-dark-50 dark:hover:bg-dark-800/50',
        className
      )}
      type="button"
    >
      {children}
      <svg
        className={cn(
          'h-5 w-5 text-dark-400 transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
  value?: string // injected by AccordionItem
}

export function AccordionContent({ children, className, value }: AccordionContentProps) {
  const context = useContext(AccordionContext)
  if (!context) throw new Error('AccordionContent must be used within Accordion')

  const isOpen = context.openItem === value

  if (!isOpen) return null

  return (
    <div
      className={cn(
        'p-4 border-t border-dark-200 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-900/50',
        className
      )}
    >
      {children}
    </div>
  )
}
