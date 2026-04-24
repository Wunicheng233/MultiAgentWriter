import React from 'react'

type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'default' | 'sm'
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sage/25 disabled:cursor-not-allowed disabled:opacity-50'

  const variantClasses: Record<Variant, string> = {
    primary: 'bg-sage text-parchment shadow-ambient hover:-translate-y-0.5 hover:bg-sage/90 hover:shadow-standard active:translate-y-0',
    secondary: 'border border-border bg-white/30 text-inkwell hover:border-sage/70 hover:bg-sage/5',
    tertiary: 'bg-transparent text-sage hover:bg-sage/5 hover:text-inkwell',
    ghost: 'bg-transparent text-secondary hover:bg-inkwell/5 hover:text-inkwell rounded-full p-2',
  }

  const sizeClasses = {
    default: 'px-6 py-3 text-base',
    sm: 'px-4 py-2 text-sm',
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button
