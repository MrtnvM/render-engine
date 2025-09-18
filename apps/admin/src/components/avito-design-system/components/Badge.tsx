import React from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'full';
}

const variantStyles = {
  default: 'bg-blue-50 text-blue-700 border border-blue-200',
  secondary: 'bg-gray-50 text-gray-700 border border-gray-200',
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  error: 'bg-red-50 text-red-700 border border-red-200',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base',
};

const roundedStyles = {
  none: 'rounded-none',
  sm: 'rounded-md',
  md: 'rounded-lg',
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
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-gray-50 text-gray-700 border-gray-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  new: 'bg-blue-50 text-blue-700 border-blue-200',
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
  default: 'bg-blue-600',
  secondary: 'bg-gray-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
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