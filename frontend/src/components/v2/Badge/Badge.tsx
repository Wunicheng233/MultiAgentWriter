import React from 'react'

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error'

export interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-[var(--accent-primary)] text-white',
  secondary: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-default)]',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  error: 'bg-red-500 text-white',
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  className = '',
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    px-2.5 py-0.5 text-xs font-medium
    rounded-[var(--radius-sm)]
  `

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim()

  return <span className={classes}>{children}</span>
}

Badge.displayName = 'Badge'
