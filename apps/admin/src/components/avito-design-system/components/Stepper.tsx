import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../utils/cn'
import type { StepperProps } from '../types/components'

// Minus Icon Component
const MinusIcon: React.FC<{ size: 's' | 'm' | 'l' }> = ({ size }) => {
  const iconSize = size === 's' ? 10 : 12
  const iconHeight = size === 's' ? 16 : 20
  
  return (
    <svg
      width={iconSize}
      height={iconHeight}
      viewBox="0 0 12 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 10H10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Add Icon Component
const AddIcon: React.FC<{ size: 's' | 'm' | 'l' }> = ({ size }) => {
  const iconSize = size === 's' ? 11 : 13
  const iconHeight = size === 's' ? 16 : 20
  
  return (
    <svg
      width={iconSize}
      height={iconHeight}
      viewBox="0 0 13 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.5 2V18M2 10H11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Spinner Icon Component
const SpinnerIcon: React.FC<{ size: 's' | 'm' | 'l' }> = ({ size }) => {
  const iconSize = size === 's' ? 14 : 16
  const iconHeight = size === 's' ? 16 : 20
  
  return (
    <svg
      width={iconSize}
      height={iconHeight}
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="avito-stepper__spinner"
    >
      <circle
        cx="8"
        cy="10"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="31.416"
        fill="none"
      />
    </svg>
  )
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      value = 0,
      min = 0,
      max = 999,
      step = 1,
      size = 'm',
      state = 'default',
      preset = 'default',
      onChange,
      onIncrement,
      onDecrement,
      disabled = false,
      className,
      errorMessage,
      placeholder = '0',
      name,
      id,
      required = false,
      readOnly = false,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value)
    const [isActive, setIsActive] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Update internal value when prop changes
    useEffect(() => {
      setInternalValue(value)
    }, [value])

    // Handle increment
    const handleIncrement = () => {
      if (disabled || state === 'disabled' || state === 'loading' || state === 'plus-disabled') {
        return
      }

      const newValue = Math.min(internalValue + step, max)
      setInternalValue(newValue)
      onChange?.(newValue)
      onIncrement?.()
    }

    // Handle decrement
    const handleDecrement = () => {
      if (disabled || state === 'disabled' || state === 'loading' || state === 'minus-disabled') {
        return
      }

      const newValue = Math.max(internalValue - step, min)
      setInternalValue(newValue)
      onChange?.(newValue)
      onDecrement?.()
    }

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      if (inputValue === '') {
        setInternalValue(0)
        onChange?.(0)
        return
      }

      const numericValue = parseInt(inputValue, 10)
      if (!isNaN(numericValue)) {
        const clampedValue = Math.max(min, Math.min(numericValue, max))
        setInternalValue(clampedValue)
        onChange?.(clampedValue)
      }
    }

    // Handle input focus
    const handleInputFocus = () => {
      setIsFocused(true)
      setIsActive(true)
    }

    // Handle input blur
    const handleInputBlur = () => {
      setIsFocused(false)
      setIsActive(false)
    }

    // Handle key down
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleIncrement()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleDecrement()
      }
    }

    // Determine current state
    const currentState = disabled ? 'disabled' : state

    // Determine if plus button is disabled
    const isPlusDisabled = disabled || 
      currentState === 'disabled' || 
      currentState === 'loading' || 
      currentState === 'plus-disabled' ||
      internalValue >= max

    // Determine if minus button is disabled
    const isMinusDisabled = disabled || 
      currentState === 'disabled' || 
      currentState === 'loading' || 
      currentState === 'minus-disabled' ||
      internalValue <= min

    // Determine if input is disabled
    const isInputDisabled = disabled || 
      currentState === 'disabled' || 
      currentState === 'loading' ||
      readOnly

    // Build CSS classes
    const stepperClasses = cn(
      'avito-stepper',
      `avito-stepper--${size}`,
      `avito-stepper--${currentState}`,
      preset !== 'default' && `avito-stepper--preset-${preset}`,
      isActive && 'avito-stepper--active',
      isFocused && 'avito-stepper--focus',
      className
    )

    const minusIconClasses = cn(
      'avito-stepper__icon',
      isMinusDisabled && 'avito-stepper__icon--disabled'
    )

    const plusIconClasses = cn(
      'avito-stepper__icon',
      isPlusDisabled && 'avito-stepper__icon--disabled'
    )

    return (
      <div className="avito-stepper-wrapper">
        <div
          ref={ref}
          className={stepperClasses}
          {...props}
        >
          <div className="avito-stepper__container">
            {/* Minus Button */}
            <button
              type="button"
              className={minusIconClasses}
              onClick={handleDecrement}
              disabled={isMinusDisabled}
              aria-label="Decrease value"
            >
              <MinusIcon size={size} />
            </button>

            {/* Quantity Display */}
            <div className="avito-stepper__quantity">
              {currentState === 'loading' ? (
                <SpinnerIcon size={size} />
              ) : (
                <>
                  <input
                    ref={inputRef}
                    type="text"
                    value={internalValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    disabled={isInputDisabled}
                    placeholder={placeholder}
                    className="avito-stepper__quantity-input"
                    name={name}
                    id={id}
                    required={required}
                    readOnly={readOnly}
                    aria-label="Quantity"
                  />
                  {isActive && (
                    <div className="avito-stepper__cursor" />
                  )}
                </>
              )}
            </div>

            {/* Add Button */}
            <button
              type="button"
              className={plusIconClasses}
              onClick={handleIncrement}
              disabled={isPlusDisabled}
              aria-label="Increase value"
            >
              <AddIcon size={size} />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && currentState === 'error' && (
          <div className="avito-stepper__error">
            {errorMessage}
          </div>
        )}
      </div>
    )
  }
)

Stepper.displayName = 'Stepper'