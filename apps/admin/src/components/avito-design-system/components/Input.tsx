import React, { useState } from 'react';
import { cn } from '../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'outlined';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const [isFocused, setIsFocused] = useState(false);

  const baseStyles = 'w-full px-3 py-2.5 bg-white border text-gray-900 placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-avito-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg';

  const variantStyles = {
    default: 'border-gray-200 hover:border-gray-300',
    outlined: 'border-2 border-gray-200 hover:border-gray-300',
  };

  const errorStyles = error
    ? 'border-red-500 focus:ring-red-500 hover:border-red-600'
    : '';

  const inputStyles = cn(
    baseStyles,
    variantStyles[variant],
    errorStyles,
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={inputStyles}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <div className="mt-1.5">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-600">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'outlined';
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  className,
  id,
  ...props
}) => {
  const textAreaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const baseStyles = 'w-full px-3 py-2 bg-white border text-avito-neutral-900 placeholder-avito-neutral-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-avito-primary-500 focus:border-transparent disabled:bg-avito-neutral-100 disabled:text-gray-500 disabled:cursor-not-allowed resize-none';

  const variantStyles = {
    default: 'border-avito-neutral-300 hover:border-avito-neutral-400',
    outlined: 'border-2 border-avito-neutral-300 hover:border-avito-neutral-400',
  };

  const errorStyles = error
    ? 'border-red-500 focus:ring-red-500 hover:border-red-600'
    : '';

  const textAreaStyles = cn(
    baseStyles,
    variantStyles[variant],
    errorStyles,
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textAreaId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}

      <textarea
        id={textAreaId}
        className={textAreaStyles}
        {...props}
      />

      {(error || helperText) && (
        <div className="mt-1.5">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-600">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};