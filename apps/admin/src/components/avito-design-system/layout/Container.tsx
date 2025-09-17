import React from 'react';
import { cn } from '../utils/cn';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  center?: boolean;
  fluid?: boolean;
}

const maxWidthStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
};

export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'lg',
  center = true,
  fluid = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'w-full',
        !fluid && maxWidthStyles[maxWidth],
        center && 'mx-auto',
        'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div';
  background?: 'white' | 'neutral' | 'primary' | 'success' | 'warning' | 'error';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  divider?: boolean;
}

const backgroundStyles = {
  white: 'bg-white',
  neutral: 'bg-avito-neutral-50',
  primary: 'bg-avito-primary-50',
  success: 'bg-avito-success-50',
  warning: 'bg-avito-warning-50',
  error: 'bg-avito-error-50',
};

const paddingStyles = {
  none: 'py-0',
  sm: 'py-4',
  md: 'py-8',
  lg: 'py-12',
  xl: 'py-16',
};

export const Section: React.FC<SectionProps> = ({
  as: Component = 'section',
  background = 'white',
  padding = 'lg',
  divider = false,
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={cn(
        'w-full',
        backgroundStyles[background],
        paddingStyles[padding],
        divider && 'border-b border-avito-neutral-200',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};