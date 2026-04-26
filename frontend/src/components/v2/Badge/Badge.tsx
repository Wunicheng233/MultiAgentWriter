import React from 'react'

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'agent' | 'status' | 'genre'

export interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-[var(--accent-primary)] text-white',
  secondary: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-default)]',
  success: 'bg-stone-100 text-stone-700 border border-stone-200',
  warning: 'bg-orange-50 text-orange-700 border border-orange-100',
  error: 'bg-rose-50 text-rose-700 border border-rose-100',
  agent: 'bg-violet-50 text-violet-700 border border-violet-100',
  status: 'bg-sky-50 text-sky-700 border border-sky-100',
  genre: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
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
