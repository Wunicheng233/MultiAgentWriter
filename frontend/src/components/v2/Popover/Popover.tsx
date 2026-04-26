import React, { createContext, useContext, useState, useRef, useCallback } from 'react'
import { useClickOutside } from '../hooks/useClickOutside'

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLDivElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

export interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export const Popover: React.FC<PopoverProps> = ({
  open: openProp,
  onOpenChange,
  children,
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp !== undefined ? openProp : internalOpen

  const triggerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const setOpen = useCallback((newOpen: boolean) => {
    if (openProp === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [openProp, onOpenChange])

  // Close on click outside
  useClickOutside(contentRef, (e) => {
    if (!triggerRef.current?.contains(e.target as Node)) {
      setOpen(false)
    }
  })

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  )
}

Popover.displayName = 'Popover'

// PopoverTrigger
export interface PopoverTriggerProps {
  children: React.ReactNode
}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children }) => {
  const context = useContext(PopoverContext)
  if (!context) throw new Error('PopoverTrigger must be used within Popover')

  const { open, setOpen, triggerRef } = context

  return (
    <div
      ref={triggerRef}
      onClick={() => setOpen(!open)}
      className="inline-block"
    >
      {children}
    </div>
  )
}

PopoverTrigger.displayName = 'PopoverTrigger'

// PopoverContent
export interface PopoverContentProps {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
}

const alignClasses = {
  start: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
}

const sideClasses = {
  top: 'bottom-full mb-2',
  bottom: 'top-full mt-2',
  left: 'right-full mr-2',
  right: 'left-full ml-2',
}

export const PopoverContent: React.FC<PopoverContentProps> = ({
  children,
  className = '',
  align = 'center',
  side = 'bottom',
}) => {
  const context = useContext(PopoverContext)
  if (!context) throw new Error('PopoverContent must be used within Popover')

  const { open, setOpen, contentRef } = context

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }, [setOpen])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      role="dialog"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      className={`absolute z-50 min-w-[200px] p-4 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-lg ${sideClasses[side]} ${alignClasses[align]} ${className}`.trim()}
    >
      {children}
    </div>
  )
}

PopoverContent.displayName = 'PopoverContent'
