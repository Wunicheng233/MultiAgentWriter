import React from 'react'

type CardVariant = 'default' | 'elevated' | 'outlined'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  variant?: CardVariant
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white/60 border-border',
  elevated: 'bg-white border-sage/20 shadow-elevated',
  outlined: 'bg-transparent border-2 border-border',
}

export const Card: React.FC<CardProps> = ({
  hoverable = false,
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = `paper-card p-6 ${variantClasses[variant]}`
  const hoverClasses = hoverable ? 'paper-card-hover' : ''
  const classes = `${baseClasses} ${hoverClasses} ${className}`

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export default Card
