import React from 'react'
import { SegmentedControlProps } from '../types/components'
import { cn } from '../utils/cn'

export const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      options,
      value,
      onChange,
      disabled = false,
      size = 'm',
      variant = 'default',
      preset = 'default',
      className,
      name,
      id,
      ariaLabel,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled

    // Base classes
    const baseClasses = 'avito-segmented-control'

    // Size classes
    const sizeClasses = {
      xs: 'avito-segmented-control--xs',
      s: 'avito-segmented-control--s',
      m: 'avito-segmented-control--m',
      l: 'avito-segmented-control--l',
      xl: 'avito-segmented-control--xl',
    }

    // Variant classes
    const variantClasses = {
      default: 'avito-segmented-control--default',
      accent: 'avito-segmented-control--accent',
      pay: 'avito-segmented-control--pay',
      success: 'avito-segmented-control--success',
      danger: 'avito-segmented-control--danger',
    }

    // Preset classes
    const presetClasses = {
      default: '',
      overlay: 'avito-segmented-control--preset-overlay',
    }

    const containerClasses = cn(
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      presetClasses[preset],
      isDisabled && 'avito-segmented-control--disabled',
      className,
    )

    const handleOptionClick = (optionValue: string) => {
      if (!isDisabled && onChange && optionValue !== value) {
        onChange(optionValue)
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) return

      const currentIndex = options.findIndex(option => option.value === value)
      let newIndex = currentIndex

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
          break
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
          break
        case 'Home':
          event.preventDefault()
          newIndex = 0
          break
        case 'End':
          event.preventDefault()
          newIndex = options.length - 1
          break
        default:
          return
      }

      const newOption = options[newIndex]
      if (newOption && !newOption.disabled && onChange) {
        onChange(newOption.value)
      }
    }

    return (
      <div
        ref={ref}
        className={containerClasses}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        tabIndex={isDisabled ? -1 : 0}
        {...props}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value
          const isOptionDisabled = isDisabled || option.disabled

          const optionClasses = cn(
            'avito-segmented-control__option',
            isSelected && 'avito-segmented-control__option--selected',
            isOptionDisabled && 'avito-segmented-control__option--disabled',
            index === 0 && 'avito-segmented-control__option--first',
            index === options.length - 1 && 'avito-segmented-control__option--last',
          )

          return (
            <button
              key={option.value}
              type="button"
              className={optionClasses}
              role="tab"
              aria-selected={isSelected}
              aria-disabled={isOptionDisabled}
              disabled={isOptionDisabled}
              onClick={() => handleOptionClick(option.value)}
              tabIndex={isSelected && !isDisabled ? 0 : -1}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    )
  },
)

SegmentedControl.displayName = 'SegmentedControl'