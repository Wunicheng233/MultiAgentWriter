import React, { forwardRef, useContext, useEffect, useMemo, useRef } from 'react'

export type CheckboxLabelPosition = 'left' | 'right'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: React.ReactNode
  labelPosition?: CheckboxLabelPosition
  indeterminate?: boolean
  value?: string
  onChange?: (checked: boolean) => void
}

interface CheckboxGroupContextValue {
  name?: string
  value: string[]
  disabled: boolean
  onChange: (value: string[]) => void
}

const CheckboxGroupContext = React.createContext<CheckboxGroupContextValue | null>(null)

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      labelPosition = 'right',
      indeterminate = false,
      disabled = false,
      checked: checkedProp,
      value,
      onChange,
      className = '',
      ...props
    },
    ref
  ) => {
    const groupContext = useContext(CheckboxGroupContext)
    const isInGroup = groupContext !== null && value !== undefined
    const groupValue = isInGroup ? groupContext.value : null
    const inputRef = useRef<HTMLInputElement>(null)

    const isChecked = useMemo(() => {
      if (isInGroup) {
        return groupValue!.includes(value!)
      }
      return checkedProp
    }, [isInGroup, groupValue, value, checkedProp])

    const isDisabled = disabled || (isInGroup && groupContext.disabled)

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate
      }
    }, [indeterminate])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked

      if (isInGroup) {
        const groupValue = groupContext.value
        let newValue: string[]

        if (checked) {
          newValue = [...groupValue, value!]
        } else {
          newValue = groupValue.filter(v => v !== value)
        }
        groupContext.onChange(newValue)
      } else if (onChange) {
        onChange(checked)
      }
    }

    return (
      <label className={`inline-flex items-center gap-2 cursor-pointer ${isDisabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`.trim()}>
        {labelPosition === 'left' && <span className="text-[var(--text-body)]">{label}</span>}
        <div className="relative flex items-center justify-center">
          <input
            ref={(node) => {
              inputRef.current = node
              if (typeof ref === 'function') {
                ref(node)
              } else if (ref) {
                ref.current = node
              }
            }}
            type="checkbox"
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            className="sr-only"
            {...props}
          />
          <div
            className={`w-4 h-4 border-2 rounded-[var(--radius-sm)] transition-all duration-[var(--duration-fast)] flex items-center justify-center ${
              isChecked || indeterminate
                ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                : 'border-[var(--border-default)]'
            } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`.trim()}
          >
            {isChecked && !indeterminate && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {indeterminate && (
              <div className="w-2 h-0.5 bg-white" />
            )}
          </div>
        </div>
        {labelPosition === 'right' && <span className="text-[var(--text-body)]">{label}</span>}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

// CheckboxGroup Component
export interface CheckboxGroupProps {
  label?: React.ReactNode
  value?: string[]
  defaultValue?: string[]
  onChange?: (value: string[]) => void
  disabled?: boolean
  layout?: 'horizontal' | 'vertical'
  children: React.ReactNode
  className?: string
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  value: valueProp,
  defaultValue = [],
  onChange,
  disabled = false,
  layout = 'vertical',
  children,
  className = '',
}) => {
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : internalValue

  const handleChange = (newValue: string[]) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  const contextValue: CheckboxGroupContextValue = {
    value,
    disabled,
    onChange: handleChange,
  }

  return (
    <fieldset className={className} role="group">
      {label && (
        <legend className="text-sm font-medium text-[var(--text-primary)] mb-2">
          {label}
        </legend>
      )}
      <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} gap-3`}>
        <CheckboxGroupContext.Provider value={contextValue}>
          {children}
        </CheckboxGroupContext.Provider>
      </div>
    </fieldset>
  )
}

CheckboxGroup.displayName = 'CheckboxGroup'
