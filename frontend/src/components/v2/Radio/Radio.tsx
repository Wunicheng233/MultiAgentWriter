import React, { forwardRef, useContext } from 'react'

export type RadioSize = 'sm' | 'md' | 'lg'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode
  size?: RadioSize
  value: string
}

interface RadioGroupContextValue {
  name: string
  value: string
  disabled: boolean
  size?: RadioSize
  onChange: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

const sizeClasses: Record<RadioSize, { container: string; dot: string }> = {
  sm: { container: 'w-3 h-3', dot: 'w-1.5 h-1.5' },
  md: { container: 'w-4 h-4', dot: 'w-2 h-2' },
  lg: { container: 'w-5 h-5', dot: 'w-2.5 h-2.5' },
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      size: sizeProp,
      value,
      disabled = false,
      checked: checkedProp,
      onChange,
      name: nameProp,
      className = '',
      ...props
    },
    ref
  ) => {
    const groupContext = useContext(RadioGroupContext)
    const isInGroup = groupContext !== null

    const size = isInGroup ? (groupContext.size || 'md') : (sizeProp || 'md')
    const isChecked = isInGroup ? groupContext.value === value : checkedProp
    const isDisabled = disabled || (isInGroup && groupContext.disabled)
    const name = isInGroup ? groupContext.name : nameProp

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isInGroup) {
        groupContext.onChange(value)
      } else if (onChange) {
        onChange(e)
      }
    }

    return (
      <label className={`inline-flex items-center gap-2 cursor-pointer ${isDisabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`.trim()}>
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="radio"
            name={name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            className="sr-only"
            {...props}
          />
          <div
            className={`${sizeClasses[size].container} border-2 rounded-full transition-all duration-[var(--duration-fast)] flex items-center justify-center ${
              isChecked
                ? 'border-[var(--accent-primary)]'
                : 'border-[var(--border-default)]'
            } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`.trim()}
          >
            {isChecked && (
              <div className={`${sizeClasses[size].dot} rounded-full bg-[var(--accent-primary)]`} />
            )}
          </div>
        </div>
        <span className="text-[var(--text-body)]">{label}</span>
      </label>
    )
  }
)

Radio.displayName = 'Radio'

// RadioGroup Component
export interface RadioGroupProps {
  label?: React.ReactNode
  name: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  size?: RadioSize
  layout?: 'horizontal' | 'vertical'
  children: React.ReactNode
  className?: string
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  value: valueProp,
  defaultValue = '',
  onChange,
  disabled = false,
  size,
  layout = 'vertical',
  children,
  className = '',
}) => {
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : internalValue

  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  const contextValue: RadioGroupContextValue = {
    name,
    value,
    disabled,
    size,
    onChange: handleChange,
  }

  return (
    <fieldset className={className} role="radiogroup">
      {label && (
        <legend className="text-sm font-medium text-[var(--text-primary)] mb-2">
          {label}
        </legend>
      )}
      <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} gap-3`}>
        <RadioGroupContext.Provider value={contextValue}>
          {children}
        </RadioGroupContext.Provider>
      </div>
    </fieldset>
  )
}

RadioGroup.displayName = 'RadioGroup'
