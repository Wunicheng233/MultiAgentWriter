import React from 'react'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps {
  src?: string
  alt?: string
  children?: React.ReactNode
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

// Generate stable color based on string
function getColorFromString(str: string): string {
  const colors = [
    'var(--accent-primary)',
    'var(--accent-warm)',
    'var(--accent-gold)',
    'var(--accent-soft)',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  children,
  size = 'md',
  className = '',
}) => {
  const bgColor = children
    ? getColorFromString(typeof children === 'string' ? children : 'avatar')
    : 'var(--bg-tertiary)'

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${className}`.trim()}
      style={{ backgroundColor: bgColor }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-[var(--text-primary)] font-medium">{children}</span>
      )}
    </div>
  )
}

Avatar.displayName = 'Avatar'

// AvatarGroup
export interface AvatarGroupProps {
  children: React.ReactNode
  max?: number
  className?: string
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max,
  className = '',
}) => {
  const childrenArray = React.Children.toArray(children)
  const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray
  const remaining = max ? childrenArray.length - max : 0

  return (
    <div className={`inline-flex items-center ${className}`.trim()}>
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className="border-2 border-[var(--bg-primary)] rounded-full -ml-2 first:ml-0"
        >
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="border-2 border-[var(--bg-primary)] rounded-full -ml-2">
          <Avatar>+{remaining}</Avatar>
        </div>
      )}
    </div>
  )
}

AvatarGroup.displayName = 'AvatarGroup'
