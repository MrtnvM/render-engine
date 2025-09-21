import React from 'react'
import { ButtonProps } from '../types/components'
import { cn } from '../utils/cn'

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      color = 'default',
      size = 'm',
      state = 'default',
      round = false,
      preset = 'default',
      onClick,
      type = 'button',
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || state === 'disabled'

    // Base button classes
    const baseClasses = 'avito-button'

    // Size classes
    const sizeClasses = {
      xs: 'avito-button--xs',
      s: 'avito-button--s',
      m: 'avito-button--m',
      l: 'avito-button--l',
      xl: 'avito-button--xl',
    }

    // Variant and color classes based on Avito Design System
    const getVariantClasses = () => {
      if (isDisabled) {
        if (preset === 'overlay') {
          return 'avito-button--overlay-disabled'
        }
        return 'avito-button--disabled'
      }

      if (variant === 'primary') {
        switch (color) {
          case 'accent':
            return 'avito-button--primary-accent'
          case 'pay':
            return 'avito-button--primary-pay'
          case 'success':
            return 'avito-button--primary-success'
          case 'danger':
            return 'avito-button--primary-danger'
          default:
            return 'avito-button--primary-default'
        }
      }

      if (variant === 'secondary') {
        switch (color) {
          case 'accent':
            return 'avito-button--secondary-accent'
          case 'pay':
            return 'avito-button--secondary-pay'
          case 'success':
            return 'avito-button--secondary-success'
          case 'danger':
            return 'avito-button--secondary-danger'
          default:
            return 'avito-button--secondary-default'
        }
      }

      if (variant === 'ghost') {
        if (preset === 'inverse') {
          return 'avito-button--ghost-inverse'
        }
        return 'avito-button--ghost-default'
      }

      return 'avito-button--primary-default'
    }

    // Preset classes
    const presetClasses = {
      default: '',
      overlay: 'avito-button--preset-overlay',
      inverse: 'avito-button--preset-inverse',
    }

    const buttonClasses = cn(
      baseClasses,
      sizeClasses[size],
      getVariantClasses(),
      round && 'avito-button--round',
      presetClasses[preset],
      className,
    )

    const handleClick = (_event: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled && onClick) {
        onClick()
      }
    }

    return (
      <button 
        ref={ref} 
        type={type} 
        disabled={isDisabled} 
        onClick={handleClick} 
        className={buttonClasses} 
        aria-disabled={isDisabled}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
