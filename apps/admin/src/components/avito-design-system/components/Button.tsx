import React from 'react';
import { cn } from '../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-avito-primary-600 text-white hover:bg-avito-primary-700 active:bg-avito-primary-800 disabled:bg-avito-neutral-300 shadow-sm hover:shadow-md transition-shadow',
  secondary: 'bg-white text-avito-neutral-900 border border-avito-neutral-200 hover:bg-avito-neutral-50 active:bg-avito-neutral-100 disabled:bg-avito-neutral-100 shadow-sm',
  outline: 'bg-transparent text-avito-primary-600 border border-avito-primary-200 hover:bg-avito-primary-50 active:bg-avito-primary-100 disabled:text-avito-neutral-400 hover:border-avito-primary-300',
  ghost: 'bg-transparent text-avito-neutral-600 hover:bg-avito-neutral-100 active:bg-avito-neutral-200 disabled:text-avito-neutral-400',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-avito-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg
          className={cn('animate-spin -ml-1 mr-2', iconSizes[size])}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {leftIcon && !isLoading && (
        <span className={cn('mr-2', iconSizes[size])}>
          {leftIcon}
        </span>
      )}

      {children}

      {rightIcon && !isLoading && (
        <span className={cn('ml-2', iconSizes[size])}>
          {rightIcon}
        </span>
      )}
    </button>
  );
};