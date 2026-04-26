import React from 'react'

export type ProgressSize = 'sm' | 'md' | 'lg'

export interface ProgressProps {
  value?: number
  size?: ProgressSize
  indeterminate?: boolean
  showLabel?: boolean
  className?: string
}

const sizeClasses: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  size = 'md',
  indeterminate = false,
  showLabel = false,
  className = '',
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100)

  return (
    <div className="flex items-center gap-3">
      <div
        data-testid="progress-bar"
        className={`relative w-full overflow-hidden bg-[var(--bg-tertiary)] rounded-full ${sizeClasses[size]} ${className}`.trim()}
      >
        <div
          className={`h-full bg-[var(--accent-primary)] transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)] ${
            indeterminate ? 'animate-[progress-indeterminate_1.5s_ease-in-out_infinite]' : ''
          }`}
          style={{
            width: indeterminate ? '30%' : `${clampedValue}%`,
            ...(indeterminate ? {
              animation: 'progress-indeterminate 1.5s ease-in-out infinite',
            } : {}),
          }}
        />
      </div>
      {showLabel && !indeterminate && (
        <span className="text-sm text-[var(--text-secondary)] min-w-[3rem] text-right">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  )
}

Progress.displayName = 'Progress'

// Circular Progress Component
export interface CircularProgressProps {
  value?: number
  size?: number
  thickness?: number
  indeterminate?: boolean
  showLabel?: boolean
  className?: string
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  size = 48,
  thickness = 4,
  indeterminate = false,
  showLabel = false,
  className = '',
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedValue / 100) * circumference

  return (
    <div
      data-testid="circular-progress"
      className={`relative inline-flex items-center justify-center ${className}`.trim()}
    >
      <svg
        width={size}
        height={size}
        className={indeterminate ? 'animate-spin' : ''}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={thickness}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth={thickness}
          strokeLinecap="round"
          className="transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showLabel && !indeterminate && (
        <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-[var(--text-primary)]">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  )
}

CircularProgress.displayName = 'CircularProgress'
