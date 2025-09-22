import React, { useState, useRef, useEffect } from 'react'
import { SelectProps } from '../types/components'
import { cn } from '../utils/cn'

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      value,
      placeholder = 'Выберите опцию',
      size = 'm',
      state = 'default',
      preset = 'default',
      options = [],
      onChange,
      disabled = false,
      className,
      name,
      id,
      required = false,
      open: controlledOpen,
      onOpenChange,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [internalValue, setInternalValue] = useState(value || '')
    const selectRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const isDisabled = disabled || state === 'disabled'
    const isControlled = controlledOpen !== undefined
    const isDropdownOpen = isControlled ? controlledOpen : isOpen

    // Find the selected option
    const selectedOption = options.find((option) => option.value === (value || internalValue))

    // Handle click outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          if (isControlled) {
            onOpenChange?.(false)
          } else {
            setIsOpen(false)
          }
        }
      }

      if (isDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isDropdownOpen, isControlled, onOpenChange])

    // Base select classes
    const baseClasses = 'avito-select'

    // Size classes
    const sizeClasses = {
      xs: 'avito-select--xs',
      s: 'avito-select--s',
      m: 'avito-select--m',
      l: 'avito-select--l',
      xl: 'avito-select--xl',
    }

    // State classes
    const getStateClasses = () => {
      if (isDisabled) {
        return 'avito-select--disabled'
      }

      switch (state) {
        case 'filled':
          return 'avito-select--filled'
        case 'error':
          return 'avito-select--error'
        case 'error-filled':
          return 'avito-select--error-filled'
        default:
          return 'avito-select--default'
      }
    }

    // Preset classes
    const presetClasses = {
      default: '',
      overlay: 'avito-select--preset-overlay',
    }

    const selectClasses = cn(
      baseClasses,
      sizeClasses[size],
      getStateClasses(),
      presetClasses[preset],
      isDropdownOpen && 'avito-select--open',
      className,
    )

    const handleToggle = () => {
      if (isDisabled) return

      const newOpenState = !isDropdownOpen
      if (isControlled) {
        onOpenChange?.(newOpenState)
      } else {
        setIsOpen(newOpenState)
      }
    }

    const handleOptionSelect = (optionValue: string) => {
      if (isDisabled) return

      setInternalValue(optionValue)
      onChange?.(optionValue)

      if (isControlled) {
        onOpenChange?.(false)
      } else {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (isDisabled) return

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault()
          handleToggle()
          break
        case 'Escape':
          if (isDropdownOpen) {
            event.preventDefault()
            if (isControlled) {
              onOpenChange?.(false)
            } else {
              setIsOpen(false)
            }
          }
          break
        case 'ArrowDown':
          event.preventDefault()
          if (!isDropdownOpen) {
            if (isControlled) {
              onOpenChange?.(true)
            } else {
              setIsOpen(true)
            }
          }
          break
        case 'ArrowUp':
          event.preventDefault()
          if (isDropdownOpen) {
            if (isControlled) {
              onOpenChange?.(false)
            } else {
              setIsOpen(false)
            }
          }
          break
      }
    }

    return (
      <div ref={ref} className='relative'>
        <div
          ref={selectRef}
          className={selectClasses}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          tabIndex={isDisabled ? -1 : 0}
          role='combobox'
          aria-expanded={isDropdownOpen}
          aria-haspopup='listbox'
          aria-disabled={isDisabled}
          aria-required={required}
          id={id}
          {...props}
        >
          <span className='flex-1 truncate'>{selectedOption ? selectedOption.label : placeholder}</span>
          <svg
            className='avito-select__arrow'
            width='14'
            height='14'
            viewBox='0 0 14 14'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M3.5 5.25L7 8.75L10.5 5.25'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>

        {isDropdownOpen && (
          <div ref={dropdownRef} className='avito-select-dropdown' role='listbox' aria-label='Select an option'>
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'avito-select-dropdown__item',
                  option.value === (value || internalValue) && 'avito-select-dropdown__item--selected',
                  option.disabled && 'avito-select-dropdown__item--disabled',
                )}
                onClick={() => !option.disabled && handleOptionSelect(option.value)}
                role='option'
                aria-selected={option.value === (value || internalValue)}
                aria-disabled={option.disabled}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}

        {/* Hidden input for form submission */}
        {name && <input type='hidden' name={name} value={value || internalValue} required={required} />}
      </div>
    )
  },
)

Select.displayName = 'Select'
