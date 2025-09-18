import React from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-white border border-avito-neutral-100',
  outlined: 'bg-white border-2 border-avito-neutral-200',
  elevated: 'bg-white shadow-sm border border-avito-neutral-50',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const roundedStyles = {
  none: 'rounded-none',
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  rounded = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'w-full',
        variantStyles[variant],
        paddingStyles[padding],
        roundedStyles[rounded],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('flex flex-col space-y-1.5', className)} {...props}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between">
          <div className="flex flex-col space-y-1">
            {title && (
              <h3 className="text-lg font-semibold text-avito-neutral-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-avito-neutral-600">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="ml-4">
              {action}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent: React.FC<CardContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('flex items-center mt-4 pt-4 border-t border-avito-neutral-200', className)}
      {...props}
    >
      {children}
    </div>
  );
};