import React from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'full';
}

const variantStyles = {
  default: 'bg-avito-primary-100 text-avito-primary-700 border border-avito-primary-200',
  secondary: 'bg-avito-neutral-100 text-avito-neutral-700 border border-avito-neutral-200',
  success: 'bg-avito-success-100 text-avito-success-700 border border-avito-success-200',
  warning: 'bg-avito-warning-100 text-avito-warning-700 border border-avito-warning-200',
  error: 'bg-avito-error-100 text-avito-error-700 border border-avito-error-200',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base',
};

const roundedStyles = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  full: 'rounded-full',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  rounded = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium transition-colors duration-200',
        variantStyles[variant],
        sizeStyles[size],
        roundedStyles[rounded],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Specific status badges for Avito-style status indicators
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'new';
}

const statusStyles = {
  active: 'bg-avito-success-100 text-avito-success-700 border-avito-success-200',
  inactive: 'bg-avito-neutral-100 text-avito-neutral-700 border-avito-neutral-200',
  pending: 'bg-avito-warning-100 text-avito-warning-700 border-avito-warning-200',
  completed: 'bg-avito-success-100 text-avito-success-700 border-avito-success-200',
  failed: 'bg-avito-error-100 text-avito-error-700 border-avito-error-200',
  new: 'bg-avito-primary-100 text-avito-primary-700 border-avito-primary-200',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  rounded = 'md',
  className,
  ...props
}) => {
  return (
    <Badge
      variant="default"
      size={size}
      rounded={rounded}
      className={cn(statusStyles[status], className)}
      {...props}
    />
  );
};

// Dot badge for small indicators
export interface DotBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const dotVariantStyles = {
  default: 'bg-avito-primary-600',
  secondary: 'bg-avito-neutral-600',
  success: 'bg-avito-success-600',
  warning: 'bg-avito-warning-600',
  error: 'bg-avito-error-600',
};

const dotSizeStyles = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

export const DotBadge: React.FC<DotBadgeProps> = ({
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-block rounded-full',
        dotVariantStyles[variant],
        dotSizeStyles[size],
        className
      )}
      {...props}
    />
  );
};