import React from 'react'
import { InputFieldSetProps } from '../types/components'
import { cn } from '../utils/cn'
import { Input } from './Input'

export const InputFieldSet = React.forwardRef<HTMLDivElement, InputFieldSetProps>(
  (
    {
      label,
      value = '',
      placeholder = '',
      size = 'm',
      state = 'default',
      preset = 'default',
      statusText,
      statusType = 'hint',
      showCloseButton = false,
      onChange,
      onClear,
      disabled = false,
      type = 'text',
      name,
      id,
      autoComplete,
      autoFocus = false,
      maxLength,
      minLength,
      pattern,
      required = false,
      readOnly = false,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || state === 'disabled'

    const labelClasses = cn(
      'avito-input-fieldset__label',
      `avito-input-fieldset__label--${size}`,
      isDisabled && 'avito-input-fieldset__label--disabled',
    )

    const statusClasses = cn(
      'avito-input-fieldset__status',
      `avito-input-fieldset__status--${statusType}`,
      `avito-input-fieldset__status--${size}`,
    )

    const fieldsetClasses = cn('avito-input-fieldset', className)

    return (
      <div ref={ref} className={fieldsetClasses} {...props}>
        {label && (
          <label className={labelClasses} htmlFor={id}>
            {label}
          </label>
        )}

        <Input
          value={value}
          placeholder={placeholder}
          size={size}
          state={state}
          preset={preset}
          showCloseButton={showCloseButton}
          onChange={onChange}
          onClear={onClear}
          disabled={disabled}
          type={type}
          name={name}
          id={id}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          required={required}
          readOnly={readOnly}
        />

        {statusText && <div className={statusClasses}>{statusText}</div>}
      </div>
    )
  },
)

InputFieldSet.displayName = 'InputFieldSet'
