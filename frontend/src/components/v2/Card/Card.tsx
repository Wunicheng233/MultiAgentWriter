import React from 'react'

export type CardVariant = 'default' | 'outlined' | 'elevated'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  hoverable?: boolean
  children: React.ReactNode
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-[var(--shadow-xs)]',
  outlined: 'bg-transparent border-2 border-[var(--border-default)]',
  elevated: 'bg-[var(--bg-secondary)] border border-[var(--accent-primary)] border-opacity-20 shadow-[var(--shadow-md)]',
}

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = `
    rounded-[var(--radius-lg)]
    transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]
  `

  const hoverClasses = hoverable
    ? 'hover:border-[var(--accent-primary)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 cursor-pointer'
    : ''

  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`.trim()

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

Card.displayName = 'Card'
