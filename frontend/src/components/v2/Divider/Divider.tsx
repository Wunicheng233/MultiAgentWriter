import React from 'react'

export type DividerOrientation = 'horizontal' | 'vertical'

export interface DividerProps {
  orientation?: DividerOrientation
  dashed?: boolean
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  dashed = false,
  children,
  className = '',
  style,
}) => {
  const isHorizontal = orientation === 'horizontal'

  // With text variant
  if (children && isHorizontal) {
    return (
      <div
        role="separator"
        className={`flex items-center w-full ${className}`.trim()}
        style={style}
      >
        <div
          className={`flex-1 ${dashed ? 'border-dashed' : 'border-solid'} border-t border-[var(--border-subtle)]`}
        />
        <span className="px-4 text-sm text-[var(--text-secondary)]">
          {children}
        </span>
        <div
          className={`flex-1 ${dashed ? 'border-dashed' : 'border-solid'} border-t border-[var(--border-subtle)]`}
        />
      </div>
    )
  }

  return (
    <div
      role="separator"
      className={`${
        isHorizontal
          ? 'w-full h-px border-t'
          : 'h-full w-px border-l'
      } ${dashed ? 'border-dashed' : 'border-solid'} border-[var(--border-subtle)] ${className}`.trim()}
      style={style}
    />
  )
}

Divider.displayName = 'Divider'
