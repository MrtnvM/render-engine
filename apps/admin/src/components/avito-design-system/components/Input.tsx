import React from 'react'
import { InputProps } from '../types/components'
import { cn } from '../utils/cn'

// Close icon SVG component
const CloseIcon: React.FC<{ size: 'xs' | 's' | 'm' | 'l' | 'xl' }> = ({ size }) => {
  const dimensions = {
    xs: { width: 8.85, height: 8.85 },
    s: { width: 8.85, height: 8.85 },
    m: { width: 11.99, height: 11.99 },
    l: { width: 11.99, height: 11.99 },
    xl: { width: 11.99, height: 11.99 },
  }

  const { width, height } = dimensions[size]

  return (
    <svg width={width} height={height} viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M9 3L3 9M3 3L9 9' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value = '',
      placeholder = '',
      size = 'm',
      state = 'default',
      preset = 'default',
      showCloseButton = false,
      onChange,
      onClear,
      disabled = false,
      className,
      type = 'text',
      name,
      id,
      autoComplete,
      autoFocus,
      maxLength,
      minLength,
      pattern,
      required,
      readOnly,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || state === 'disabled'
    const hasValue = value && value.length > 0
    const shouldShowCloseButton = showCloseButton && hasValue && !isDisabled

    // Base input classes
    const baseClasses = 'avito-input'

    // Size classes
    const sizeClasses = {
      xs: 'avito-input--xs',
      s: 'avito-input--s',
      m: 'avito-input--m',
      l: 'avito-input--l',
      xl: 'avito-input--xl',
    }

    // State classes
    const getStateClasses = () => {
      if (isDisabled) {
        return 'avito-input--disabled'
      }

      switch (state) {
        case 'filled':
          return 'avito-input--filled'
        case 'error':
          return 'avito-input--error'
        case 'error-filled':
          return 'avito-input--error-filled'
        default:
          return 'avito-input--default'
      }
    }

    // Preset classes
    const presetClasses = {
      default: '',
      overlay: 'avito-input--preset-overlay',
    }

    const inputClasses = cn(baseClasses, sizeClasses[size], getStateClasses(), presetClasses[preset], className)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isDisabled && onChange) {
        onChange(event.target.value)
      }
    }

    const handleClear = () => {
      if (!isDisabled && onClear) {
        onClear()
      }
    }

    const inputElement = (
      <input
        ref={ref}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={isDisabled}
        onChange={handleChange}
        className={inputClasses}
        name={name}
        id={id}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        required={required}
        readOnly={readOnly}
        aria-disabled={isDisabled}
        {...props}
      />
    )

    if (shouldShowCloseButton) {
      return (
        <div className='avito-input-container'>
          {inputElement}
          <button
            type='button'
            className={cn('avito-input-close-button', `avito-input-close-button--${size}`)}
            onClick={handleClear}
            disabled={isDisabled}
            aria-label='Clear input'
          >
            <CloseIcon size={size} />
          </button>
        </div>
      )
    }

    return inputElement
  },
)

Input.displayName = 'Input'
