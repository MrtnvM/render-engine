import React from 'react';
import { cn } from '../utils/cn';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

const gapStyles = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const alignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyStyles = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const getColsClass = (cols: GridProps['cols']) => {
  if (typeof cols === 'number') {
    return `grid-cols-${cols}`;
  }

  const classes = [];
  if (cols?.sm) classes.push(`sm:grid-cols-${cols.sm}`);
  if (cols?.md) classes.push(`md:grid-cols-${cols.md}`);
  if (cols?.lg) classes.push(`lg:grid-cols-${cols.lg}`);
  if (cols?.xl) classes.push(`xl:grid-cols-${cols.xl}`);

  return classes.join(' ');
};

export const Grid: React.FC<GridProps> = ({
  cols = 1,
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'grid w-full',
        getColsClass(cols),
        gapStyles[gap],
        alignStyles[align],
        justifyStyles[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: number;
  colStart?: number;
  rowSpan?: number;
  rowStart?: number;
}

export const GridItem: React.FC<GridItemProps> = ({
  colSpan,
  colStart,
  rowSpan,
  rowStart,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        colSpan && `col-span-${colSpan}`,
        colStart && `col-start-${colStart}`,
        rowSpan && `row-span-${rowSpan}`,
        rowStart && `row-start-${rowStart}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Flex layout component
export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

const directionStyles = {
  row: 'flex-row',
  col: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'col-reverse': 'flex-col-reverse',
};

const flexAlignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const flexJustifyStyles = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const wrapStyles = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  align = 'start',
  justify = 'start',
  gap = 'none',
  wrap = 'nowrap',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex',
        directionStyles[direction],
        flexAlignStyles[align],
        flexJustifyStyles[justify],
        gapStyles[gap],
        wrapStyles[wrap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};