import React, { useState } from 'react'
import { cn } from '../utils/cn'
import { Select } from './Select'
import { SelectOption } from '../types/components'

export interface SelectFieldsetProps {
  label: string
  placeholder?: string
  value?: string
  options?: SelectOption[]
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
  },
  s: {
    container: 'gap-2',
    label: 'text-sm font-bold leading-[1.29]', // H60
  },
  m: {
    container: 'gap-3',
    label: 'text-base font-bold leading-[1.25]', // H50
  },
  l: {
    container: 'gap-3',
    label: 'text-base font-bold leading-[1.25]', // H50
  },
  xl: {
    container: 'gap-3',
    label: 'text-xl font-bold leading-[1.24]', // H30
  },
}

const stateClasses = {
  default: {
    label: 'text-black',
  },
  filled: {
    label: 'text-black',
  },
  disabled: {
    label: 'text-[#A3A3A3]',
  },
  error: {
    label: 'text-black',
  },
  active: {
    label: 'text-black',
  },
}

// Map SelectFieldset states to Select component states
const mapStateToSelectState = (state: SelectFieldsetProps['state']): 'default' | 'filled' | 'error' | 'error-filled' | 'disabled' => {
  switch (state) {
    case 'filled':
      return 'filled'
    case 'disabled':
      return 'disabled'
    case 'error':
      return 'error'
    case 'active':
      return 'default' // Active state is handled by the Select component's open state
    default:
      return 'default'
  }
}

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
  const currentSize = sizeClasses[size]
  const currentState = stateClasses[state]
  const hasError = state === 'error'
  const isActive = state === 'active'

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      onOpen?.()
    } else {
      onClose?.()
    }
  }

  return (
    <div className={cn('flex flex-col', currentSize.container, className)}>
      {/* Label */}
      <div className='flex flex-col'>
        <label className={cn('font-manrope', currentSize.label, currentState.label)}>{label}</label>
      </div>

      {/* Select Component */}
      <Select
        value={value}
        placeholder={placeholder}
        options={options}
        size={size}
        state={mapStateToSelectState(state)}
        onChange={onChange}
        disabled={state === 'disabled'}
        open={isActive || isOpen}
        onOpenChange={handleOpenChange}
      />

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
