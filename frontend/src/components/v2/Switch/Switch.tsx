import React, { forwardRef, useState } from 'react'
import { useId } from '../hooks/useId'

export type SwitchSize = 'sm' | 'md' | 'lg'

export interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: SwitchSize
  label?: React.ReactNode
  labelPosition?: 'left' | 'right'
  className?: string
}

const sizeClasses: Record<SwitchSize, { track: string; thumb: string }> = {
  sm: {
    track: 'w-5 h-3',
    thumb: 'w-2.5 h-2.5',
  },
  md: {
    track: 'w-7 h-4',
    thumb: 'w-3 h-3',
  },
  lg: {
    track: 'w-9 h-5',
    thumb: 'w-4 h-4',
  },
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      checked: checkedProp,
      defaultChecked = false,
      onChange,
      disabled = false,
      size = 'md',
      label,
      labelPosition = 'right',
      className = '',
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked)
    const isControlled = checkedProp !== undefined
    const checked = isControlled ? checkedProp : internalChecked
    const id = useId('switch')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return
      const newChecked = e.target.checked
      if (!isControlled) {
        setInternalChecked(newChecked)
      }
      onChange?.(newChecked)
    }

    return (
      <label
        className={`inline-flex items-center gap-2 cursor-pointer ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        } ${className}`.trim()}
        htmlFor={id}
      >
        {labelPosition === 'left' && label && (
          <span className="text-[var(--text-body)] select-none">{label}</span>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            role="switch"
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className="sr-only"
            aria-checked={checked}
          />
          {/* Track */}
          <div
            className={`${sizeClasses[size].track} rounded-full transition-colors duration-150 ${
              checked
                ? 'bg-[var(--accent-primary)]'
                : 'bg-[var(--border-default)]'
            }`}
          />
          {/* Thumb */}
          <div
            className={`${sizeClasses[size].thumb} absolute top-1/2 -translate-y-1/2 bg-white rounded-full shadow-sm transition-all duration-150 ${
              checked ? 'translate-x-full' : 'translate-x-0'
            }`}
            style={{
              transform: checked
                ? `translate(calc(100% - 2px), -50%)`
                : 'translate(2px, -50%)',
            }}
          />
        </div>
        {labelPosition === 'right' && label && (
          <span className="text-[var(--text-body)] select-none">{label}</span>
        )}
      </label>
    )
  }
)

Switch.displayName = 'Switch'
