import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../utils/cn'

export interface SelectFieldsetProps {
  label: string
  placeholder?: string
  value?: string
  options?: Array<{ value: string; label: string }>
  size?: 'xs' | 's' | 'm' | 'l' | 'xl'
  state?: 'default' | 'filled' | 'disabled' | 'error' | 'active'
  errorText?: string
  hintText?: string
  successText?: string
  className?: string
  onChange?: (value: string) => void
  onOpen?: () => void
  onClose?: () => void
}

const sizeClasses = {
  xs: {
    container: 'gap-2',
    label: 'text-sm font-bold leading-[1.29]', // H60
    select: 'px-3 py-2 text-sm leading-[1.23] rounded-[10px]', // S20
    icon: 'w-2.5 h-4',
    dropdown: 'mt-2 rounded-[10px]',
    item: 'px-3 py-1.5 text-sm leading-[1.23]', // S20
  },
  s: {
    container: 'gap-2',
    label: 'text-sm font-bold leading-[1.29]', // H60
    select: 'px-3.5 py-2.5 text-sm leading-[1.23] rounded-xl', // S20
    icon: 'w-2.5 h-4',
    dropdown: 'mt-2 rounded-xl',
    item: 'px-3.5 py-2.5 text-sm leading-[1.23]', // S20
  },
  m: {
    container: 'gap-3',
    label: 'text-base font-bold leading-[1.25]', // H50
    select: 'px-4 py-3 text-base leading-[1.33] rounded-xl', // M20
    icon: 'w-3 h-5',
    dropdown: 'mt-2 rounded-xl',
    item: 'px-4 py-3 text-base leading-[1.33]', // M20
  },
  l: {
    container: 'gap-3',
    label: 'text-base font-bold leading-[1.25]', // H50
    select: 'px-4.5 py-4 text-base leading-[1.33] rounded-2xl', // M20
    icon: 'w-3 h-5',
    dropdown: 'mt-2 rounded-2xl',
    item: 'px-4.5 py-4 text-base leading-[1.33]', // M20
  },
  xl: {
    container: 'gap-3',
    label: 'text-xl font-bold leading-[1.24]', // H30
    select: 'px-6 py-5 text-lg leading-[1.22] rounded-[20px]', // L20
    icon: 'w-3 h-5',
    dropdown: 'mt-2 rounded-[20px]',
    item: 'px-6 py-5 text-lg leading-[1.22]', // L20
  },
}

const stateClasses = {
  default: {
    label: 'text-black',
    select: 'bg-[#F2F1F0] text-black border-0',
    placeholder: 'text-[#757575]',
    icon: 'text-black',
  },
  filled: {
    label: 'text-black',
    select: 'bg-[#F2F1F0] text-black border-0',
    placeholder: 'text-[#757575]',
    icon: 'text-black',
  },
  disabled: {
    label: 'text-[#A3A3A3]',
    select: 'bg-[#F2F1F0] text-[#A3A3A3] border-0 cursor-not-allowed',
    placeholder: 'text-[#A3A3A3]',
    icon: 'text-[#A3A3A3]',
  },
  error: {
    label: 'text-black',
    select: 'bg-[#F2F1F0] text-black border border-[#FF4053]',
    placeholder: 'text-[#757575]',
    icon: 'text-black',
  },
  active: {
    label: 'text-black',
    select: 'bg-[#F2F1F0] text-black border-0',
    placeholder: 'text-[#757575]',
    icon: 'text-black',
  },
}

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width='12' height='20' viewBox='0 0 12 20' fill='none' className={className}>
    <path d='M6 8.5L1.5 3L10.5 3L6 8.5Z' fill='currentColor' />
  </svg>
)

const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width='12' height='20' viewBox='0 0 12 20' fill='none' className={className}>
    <path d='M6 11.5L1.5 17L10.5 17L6 11.5Z' fill='currentColor' />
  </svg>
)

export const SelectFieldset: React.FC<SelectFieldsetProps> = ({
  label,
  placeholder = 'Выберите',
  value,
  options = [],
  size = 'm',
  state = 'default',
  errorText,
  hintText,
  successText,
  className,
  onChange,
  onOpen,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || '')
  const selectRef = useRef<HTMLDivElement>(null)

  const currentSize = sizeClasses[size]
  const currentState = stateClasses[state]
  const isDisabled = state === 'disabled'
  const hasError = state === 'error'
  const isActive = state === 'active' || isOpen

  const selectedOption = options.find((option) => option.value === selectedValue)

  const handleToggle = () => {
    if (isDisabled) return

    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)

    if (newIsOpen) {
      onOpen?.()
    } else {
      onClose?.()
    }
  }

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue)
    onChange?.(optionValue)
    setIsOpen(false)
    onClose?.()
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false)
      onClose?.()
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  return (
    <div className={cn('flex flex-col', currentSize.container, className)}>
      {/* Label */}
      <div className='flex flex-col'>
        <label className={cn('font-manrope', currentSize.label, currentState.label)}>{label}</label>
      </div>

      {/* Select Container */}
      <div className='relative' ref={selectRef}>
        <button
          type='button'
          onClick={handleToggle}
          disabled={isDisabled}
          className={cn(
            'font-manrope flex w-full items-center justify-between gap-1.5',
            currentSize.select,
            currentState.select,
            isActive && 'ring-2 ring-blue-500 ring-offset-2',
          )}
        >
          <span className={cn('flex-1 text-left', selectedOption ? currentState.select : currentState.placeholder)}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <div className={cn('flex flex-shrink-0 items-center justify-center', currentSize.icon)}>
            {isOpen ? (
              <ChevronUpIcon className={cn('w-full h-full', currentState.icon)} />
            ) : (
              <ChevronDownIcon className={cn('w-full h-full', currentState.icon)} />
            )}
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && options.length > 0 && (
          <div
            className={cn(
              'absolute top-full right-0 left-0 z-50 border border-gray-200 bg-white shadow-lg',
              currentSize.dropdown,
            )}
          >
            <div className='max-h-60 overflow-y-auto'>
              {options.map((option) => (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'font-manrope w-full text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                    currentSize.item,
                    selectedValue === option.value ? 'bg-blue-50 text-blue-900' : 'text-black',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Text */}
      {(hasError && errorText) || hintText || successText ? (
        <div className='mt-1.5'>
          {hasError && errorText && <p className='font-manrope text-sm leading-[1.38] text-[#FF4053]'>{errorText}</p>}
          {!hasError && hintText && <p className='font-manrope text-sm leading-[1.38] text-gray-500'>{hintText}</p>}
          {!hasError && successText && (
            <p className='font-manrope text-sm leading-[1.38] text-green-600'>{successText}</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
